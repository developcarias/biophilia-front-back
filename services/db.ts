import mysql from 'mysql2/promise';
import { config } from '../config';
import { PageContent, User } from '../types';

const pool = mysql.createPool(config.db);

// Helper to parse JSON fields from a database row or array of rows
const parseJsonFields = (data: any, fields: string[]): any => {
    if (!data) return data;
    if (Array.isArray(data)) {
        return data.map(item => parseJsonFields(item, fields));
    }
    const parsedData = { ...data };
    for (const field of fields) {
        if (parsedData[field] && typeof parsedData[field] === 'string') {
            try {
                parsedData[field] = JSON.parse(parsedData[field]);
            } catch (e) {
                console.error(`Failed to parse JSON for field ${field} in item ID ${parsedData.id}:`, parsedData[field]);
                // Keep it as a string if parsing fails, to avoid crashing
            }
        }
    }
    return parsedData;
};

// Helper to stringify JSON fields before DB insertion/update
const stringifyJsonFields = (data: any, fields: string[]): any => {
    if (!data) return data;
    const stringifiedData = { ...data };
    for (const field of fields) {
        if (stringifiedData[field] && typeof stringifiedData[field] === 'object') {
            stringifiedData[field] = JSON.stringify(stringifiedData[field]);
        }
    }
    return stringifiedData;
}


export async function getContent(): Promise<PageContent> {
    const connection = await pool.getConnection();
    try {
        const [globalRows] = await connection.query('SELECT * FROM global_content WHERE id = 1');
        const [uiRows] = await connection.query('SELECT * FROM ui_text WHERE id = 1');
        const [pagesRows] = await connection.query('SELECT * FROM pages_content');
        const [projectsRows] = await connection.query('SELECT * FROM projects ORDER BY display_order ASC');
        const [teamRows] = await connection.query('SELECT * FROM team_members ORDER BY display_order ASC');
        const [blogRows] = await connection.query('SELECT * FROM blog_posts ORDER BY date DESC');
        const [allActivitiesRows] = await connection.query('SELECT * FROM project_activities ORDER BY display_order ASC');

        // Parse all JSON fields from DB strings to JS objects
        const globalContent = parseJsonFields((globalRows as any)[0], ['navigation', 'socialLinks', 'footer']);
        const uiText = JSON.parse((uiRows as any)[0].texts || '{}');
        
        const pagesContent: any = {};
        (pagesRows as any[]).forEach(row => {
            try {
                // The content column can sometimes contain unescaped control characters from manual DB entries.
                // This will cause JSON.parse to fail. We try to parse it as is, but have a fallback.
                pagesContent[row.page_name] = JSON.parse(row.content || '{}');
            } catch (error) {
                console.error(`Could not parse content for page "${row.page_name}". It may contain invalid JSON characters. Error: ${error}`);
                // Fallback to an empty object for the corrupted page to prevent the whole app from crashing.
                // The user can then fix the content in the admin panel and save it, which will correct the JSON in the DB.
                pagesContent[row.page_name] = {};
            }
        });

        const parsedActivities = parseJsonFields(allActivitiesRows, ['title', 'description']);
        const parsedProjects = parseJsonFields(projectsRows, ['title', 'description', 'detailDescription']).map((p: any) => ({
            ...p,
            activities: parsedActivities.filter((a: any) => a.project_id === p.id)
        }));

        const parsedTeam = parseJsonFields(teamRows, ['name', 'role', 'bio']);
        const parsedBlog = parseJsonFields(blogRows, ['title', 'summary', 'content']);


        return {
            global: globalContent,
            ui: uiText,
            homePage: pagesContent.homePage,
            aboutPage: pagesContent.aboutPage,
            projectsPage: pagesContent.projectsPage,
            projectDetailPage: pagesContent.projectDetailPage,
            teamPage: pagesContent.teamPage,
            blogPage: pagesContent.blogPage,
            contactPage: pagesContent.contactPage,
            donatePage: pagesContent.donatePage,
            projects: parsedProjects,
            team: parsedTeam,
            blog: parsedBlog,
        };
    } finally {
        connection.release();
    }
}

export async function updateContent(content: PageContent): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Update Global Content
        const globalData = stringifyJsonFields(content.global, ['navigation', 'socialLinks', 'footer']);
        const updateGlobalQuery = 'UPDATE global_content SET logoUrl = ?, navigation = ?, socialLinks = ?, footer = ? WHERE id = 1';
        await connection.execute(updateGlobalQuery, [globalData.logoUrl, globalData.navigation, globalData.socialLinks, globalData.footer]);

        // 2. Update UI Text
        await connection.execute('UPDATE ui_text SET texts = ? WHERE id = 1', [JSON.stringify(content.ui)]);

        // 3. Update Pages Content
        const pageKeys: (keyof PageContent)[] = ['homePage', 'aboutPage', 'projectsPage', 'projectDetailPage', 'teamPage', 'blogPage', 'contactPage', 'donatePage'];
        for (const pageKey of pageKeys) {
            if (content[pageKey]) {
                await connection.execute('UPDATE pages_content SET content = ? WHERE page_name = ?', [JSON.stringify(content[pageKey]), pageKey]);
            }
        }
        
        // 4. Synchronize Projects and Activities
        if (content.projects && Array.isArray(content.projects)) {
            const [projectCountResult] = await connection.query('SELECT COUNT(*) as count FROM projects');
            if ((projectCountResult as any)[0].count > 0 && content.projects.length === 0) {
                console.warn("SAFETY-LOCK: An attempt to save an empty list of projects was blocked to prevent accidental data loss. No changes were made to projects or activities.");
            } else {
                const [existingProjectRows] = await connection.query('SELECT id FROM projects');
                const existingProjectIds = (existingProjectRows as any[]).map(p => p.id);
                const incomingProjectIds = content.projects.map(p => p.id);

                const projectIdsToDelete = existingProjectIds.filter(id => !incomingProjectIds.includes(id));
                if (projectIdsToDelete.length > 0) {
                    await connection.query('DELETE FROM project_activities WHERE project_id IN (?)', [projectIdsToDelete]);
                    await connection.query('DELETE FROM projects WHERE id IN (?)', [projectIdsToDelete]);
                }

                for (const [index, project] of content.projects.entries()) {
                    const { activities, ...projectData } = project;
                    const stringifiedProject = stringifyJsonFields(projectData, ['title', 'description', 'detailDescription']);
                    
                    const [existingRows] = await connection.query('SELECT id FROM projects WHERE id = ?', [stringifiedProject.id]);
                    if ((existingRows as any[]).length > 0) {
                        // UPDATE
                        const updateQuery = `UPDATE projects SET title=?, description=?, detailDescription=?, imageUrl=?, imageAlt=?, detailImageUrl=?, display_order=? WHERE id=?`;
                        await connection.execute(updateQuery, [
                            stringifiedProject.title, stringifiedProject.description, stringifiedProject.detailDescription,
                            stringifiedProject.imageUrl, stringifiedProject.imageAlt, stringifiedProject.detailImageUrl, index, stringifiedProject.id
                        ]);
                    } else {
                        // INSERT
                        const insertQuery = `INSERT INTO projects (id, title, description, detailDescription, imageUrl, imageAlt, detailImageUrl, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                        await connection.execute(insertQuery, [
                            stringifiedProject.id, stringifiedProject.title, stringifiedProject.description, stringifiedProject.detailDescription,
                            stringifiedProject.imageUrl, stringifiedProject.imageAlt, stringifiedProject.detailImageUrl, index
                        ]);
                    }
                    
                    if (activities && Array.isArray(activities)) {
                        const [existingActivityRows] = await connection.query('SELECT id FROM project_activities WHERE project_id = ?', [project.id]);
                        const existingActivityIds = (existingActivityRows as any[]).map(a => a.id);
                        const incomingActivityIds = activities.map(a => a.id);

                        const activityIdsToDelete = existingActivityIds.filter(id => !incomingActivityIds.includes(id));
                        if (activityIdsToDelete.length > 0) {
                            await connection.query('DELETE FROM project_activities WHERE id IN (?)', [activityIdsToDelete]);
                        }

                        for(const [actIndex, activity] of activities.entries()) {
                             const stringifiedActivity = stringifyJsonFields(activity, ['title', 'description']);
                             const [existingActRows] = await connection.query('SELECT id FROM project_activities WHERE id = ?', [stringifiedActivity.id]);

                             if ((existingActRows as any[]).length > 0) {
                                // UPDATE Activity
                                const updateActQuery = `UPDATE project_activities SET date=?, title=?, description=?, imageUrl=?, project_id=?, display_order=? WHERE id=?`;
                                await connection.execute(updateActQuery, [
                                    stringifiedActivity.date, stringifiedActivity.title, stringifiedActivity.description,
                                    stringifiedActivity.imageUrl, project.id, actIndex, stringifiedActivity.id
                                ]);
                             } else {
                                // INSERT Activity
                                const insertActQuery = `INSERT INTO project_activities (id, date, title, description, imageUrl, project_id, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                                await connection.execute(insertActQuery, [
                                    stringifiedActivity.id, stringifiedActivity.date, stringifiedActivity.title, stringifiedActivity.description,
                                    stringifiedActivity.imageUrl, project.id, actIndex
                                ]);
                             }
                        }
                    }
                }
            }
        } else {
            console.warn("Skipping projects update due to invalid or missing data.");
        }
        
        // 5. Synchronize Team Members
        if (content.team && Array.isArray(content.team)) {
            const [teamCountResult] = await connection.query('SELECT COUNT(*) as count FROM team_members');
            if ((teamCountResult as any)[0].count > 0 && content.team.length === 0) {
                console.warn("SAFETY-LOCK: An attempt to save an empty list of team members was blocked to prevent accidental data loss. No changes were made to team members.");
            } else {
                const [existingTeamRows] = await connection.query('SELECT id FROM team_members');
                const existingTeamIds = (existingTeamRows as any[]).map(t => t.id);
                const incomingTeamIds = content.team.map(t => t.id);

                const teamIdsToDelete = existingTeamIds.filter(id => !incomingTeamIds.includes(id));
                if (teamIdsToDelete.length > 0) {
                    await connection.query('DELETE FROM team_members WHERE id IN (?)', [teamIdsToDelete]);
                }

                for (const [index, member] of content.team.entries()) {
                    const stringifiedMember = stringifyJsonFields(member, ['name', 'role', 'bio']);
                    const [existingRows] = await connection.query('SELECT id FROM team_members WHERE id = ?', [stringifiedMember.id]);
                    if ((existingRows as any[]).length > 0) {
                        // UPDATE
                        const updateQuery = `UPDATE team_members SET name=?, role=?, bio=?, imageUrl=?, imageAlt=?, display_order=? WHERE id=?`;
                        await connection.execute(updateQuery, [
                            stringifiedMember.name, stringifiedMember.role, stringifiedMember.bio,
                            stringifiedMember.imageUrl, stringifiedMember.imageAlt, index, stringifiedMember.id
                        ]);
                    } else {
                        // INSERT
                        const insertQuery = `INSERT INTO team_members (id, name, role, bio, imageUrl, imageAlt, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                        await connection.execute(insertQuery, [
                            stringifiedMember.id, stringifiedMember.name, stringifiedMember.role, stringifiedMember.bio,
                            stringifiedMember.imageUrl, stringifiedMember.imageAlt, index
                        ]);
                    }
                }
            }
        } else {
            console.warn("Skipping team members update due to invalid or missing data.");
        }


        // 6. Synchronize Blog Posts
        if (content.blog && Array.isArray(content.blog)) {
            const [blogCountResult] = await connection.query('SELECT COUNT(*) as count FROM blog_posts');
            if ((blogCountResult as any)[0].count > 0 && content.blog.length === 0) {
                console.warn("SAFETY-LOCK: An attempt to save an empty list of blog posts was blocked to prevent accidental data loss. No changes were made to blog posts.");
            } else {
                const [existingBlogRows] = await connection.query('SELECT id FROM blog_posts');
                const existingBlogIds = (existingBlogRows as any[]).map(b => b.id);
                const incomingBlogIds = content.blog.map(b => b.id);

                const blogIdsToDelete = existingBlogIds.filter(id => !incomingBlogIds.includes(id));
                if (blogIdsToDelete.length > 0) {
                    await connection.query('DELETE FROM blog_posts WHERE id IN (?)', [blogIdsToDelete]);
                }

                for (const post of content.blog) {
                     const stringifiedPost = stringifyJsonFields(post, ['title', 'summary', 'content']);
                     const [existingRows] = await connection.query('SELECT id FROM blog_posts WHERE id = ?', [stringifiedPost.id]);

                     if ((existingRows as any[]).length > 0) {
                        // UPDATE
                        const updateQuery = `UPDATE blog_posts SET slug=?, title=?, author=?, date=?, summary=?, content=?, imageUrl=?, imageAlt=? WHERE id=?`;
                        await connection.execute(updateQuery, [
                            stringifiedPost.slug, stringifiedPost.title, stringifiedPost.author, stringifiedPost.date,
                            stringifiedPost.summary, stringifiedPost.content, stringifiedPost.imageUrl, stringifiedPost.imageAlt, stringifiedPost.id
                        ]);
                     } else {
                        // INSERT
                        const insertQuery = `INSERT INTO blog_posts (id, slug, title, author, date, summary, content, imageUrl, imageAlt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                        await connection.execute(insertQuery, [
                            stringifiedPost.id, stringifiedPost.slug, stringifiedPost.title, stringifiedPost.author, stringifiedPost.date,
                            stringifiedPost.summary, stringifiedPost.content, stringifiedPost.imageUrl, stringifiedPost.imageAlt
                        ]);
                     }
                }
            }
        } else {
             console.warn("Skipping blog posts update due to invalid or missing data.");
        }
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Database transaction failed. Rolling back changes. Error:", error);
        throw error;
    } finally {
        connection.release();
    }
}

// --- User Management ---
export async function getUserByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return (rows as any)[0] || null;
}

export async function getAllUsers(): Promise<User[]> {
    const [rows] = await pool.execute('SELECT id, username FROM users');
    return rows as User[];
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
    const { username, password } = user;
    const [result] = await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    const insertId = (result as any).insertId;
    return { id: insertId, username };
}

export async function updateUser(id: number, updates: Partial<User>): Promise<void> {
    const { username, password } = updates;
    if (password && username) {
        await pool.execute('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, password, id]);
    } else if (username) {
        await pool.execute('UPDATE users SET username = ? WHERE id = ?', [username, id]);
    } else if (password) {
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [password, id]);
    }
}

export async function deleteUser(id: number): Promise<void> {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
}