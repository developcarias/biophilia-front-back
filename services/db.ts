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
                pagesContent[row.page_name] = JSON.parse(row.content || '{}');
            } catch (error) {
                console.error(`Could not parse content for page "${row.page_name}". It may contain invalid JSON characters. Error: ${error}`);
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
    await connection.beginTransaction();

    try {
        // 1. Update Global Content, UI Text, and Static Page Content (These are safe single-row updates)
        const globalData = stringifyJsonFields(content.global, ['navigation', 'socialLinks', 'footer']);
        await connection.execute('UPDATE global_content SET logoUrl = ?, navigation = ?, socialLinks = ?, footer = ? WHERE id = 1', [globalData.logoUrl, globalData.navigation, globalData.socialLinks, globalData.footer]);
        await connection.execute('UPDATE ui_text SET texts = ? WHERE id = 1', [JSON.stringify(content.ui)]);
        const pageKeys: (keyof PageContent)[] = ['homePage', 'aboutPage', 'projectsPage', 'projectDetailPage', 'teamPage', 'blogPage', 'contactPage', 'donatePage'];
        for (const pageKey of pageKeys) {
            if (content[pageKey]) {
                await connection.execute('UPDATE pages_content SET content = ? WHERE page_name = ?', [JSON.stringify(content[pageKey]), pageKey]);
            }
        }
        
        // --- SURGICAL SYNCHRONIZATION FOR DYNAMIC LISTS ---

        // 2. Synchronize Projects and Activities
        const [dbProjectsRows] = await connection.query('SELECT id FROM projects');
        const dbProjectIds = new Set((dbProjectsRows as any[]).map(r => r.id));
        const frontendProjectIds = new Set((content.projects || []).map(p => p.id));

        if (dbProjectIds.size > 0 && frontendProjectIds.size === 0) {
            throw new Error("SAFETY LOCK: An attempt to delete all projects was blocked.");
        }

        const projectIdsToDelete = [...dbProjectIds].filter(id => !frontendProjectIds.has(id));
        if (projectIdsToDelete.length > 0) {
            await connection.query('DELETE FROM project_activities WHERE project_id IN (?)', [projectIdsToDelete]);
            await connection.query('DELETE FROM projects WHERE id IN (?)', [projectIdsToDelete]);
        }

        for (const [index, project] of (content.projects || []).entries()) {
            const { activities, ...projectData } = project;
            const stringifiedProject = stringifyJsonFields(projectData, ['title', 'description', 'detailDescription']);
            await connection.query(
                `INSERT INTO projects (id, title, description, detailDescription, imageUrl, imageAlt, detailImageUrl, display_order)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 title = VALUES(title), description = VALUES(description), detailDescription = VALUES(detailDescription), imageUrl = VALUES(imageUrl), 
                 imageAlt = VALUES(imageAlt), detailImageUrl = VALUES(detailImageUrl), display_order = VALUES(display_order)`,
                [stringifiedProject.id, stringifiedProject.title, stringifiedProject.description, stringifiedProject.detailDescription, 
                 stringifiedProject.imageUrl, stringifiedProject.imageAlt, stringifiedProject.detailImageUrl, index]
            );

            // Synchronize activities for the current project
            const [dbActivitiesRows] = await connection.query('SELECT id FROM project_activities WHERE project_id = ?', [project.id]);
            const dbActivityIds = new Set((dbActivitiesRows as any[]).map(r => r.id));
            const frontendActivityIds = new Set((activities || []).map(a => a.id));
            
            const activityIdsToDelete = [...dbActivityIds].filter(id => !frontendActivityIds.has(id));
            if (activityIdsToDelete.length > 0) {
                await connection.query('DELETE FROM project_activities WHERE id IN (?)', [activityIdsToDelete]);
            }

            for (const [actIndex, activity] of (activities || []).entries()) {
                const stringifiedActivity = stringifyJsonFields(activity, ['title', 'description']);
                await connection.query(
                    `INSERT INTO project_activities (id, date, title, description, imageUrl, project_id, display_order)
                     VALUES (?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     date = VALUES(date), title = VALUES(title), description = VALUES(description), imageUrl = VALUES(imageUrl), display_order = VALUES(display_order)`,
                    [stringifiedActivity.id, stringifiedActivity.date, stringifiedActivity.title, stringifiedActivity.description, stringifiedActivity.imageUrl, project.id, actIndex]
                );
            }
        }

        // 3. Synchronize Team Members
        const [dbTeamRows] = await connection.query('SELECT id FROM team_members');
        const dbTeamIds = new Set((dbTeamRows as any[]).map(r => r.id));
        const frontendTeamIds = new Set((content.team || []).map(m => m.id));

        if (dbTeamIds.size > 0 && frontendTeamIds.size === 0) {
            throw new Error("SAFETY LOCK: An attempt to delete all team members was blocked.");
        }

        const teamIdsToDelete = [...dbTeamIds].filter(id => !frontendTeamIds.has(id));
        if (teamIdsToDelete.length > 0) {
            await connection.query('DELETE FROM team_members WHERE id IN (?)', [teamIdsToDelete]);
        }

        for (const [index, member] of (content.team || []).entries()) {
            const stringifiedMember = stringifyJsonFields(member, ['name', 'role', 'bio']);
            await connection.query(
                `INSERT INTO team_members (id, name, role, bio, imageUrl, imageAlt, display_order)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 name = VALUES(name), role = VALUES(role), bio = VALUES(bio), 
                 imageUrl = VALUES(imageUrl), imageAlt = VALUES(imageAlt), display_order = VALUES(display_order)`,
                [stringifiedMember.id, stringifiedMember.name, stringifiedMember.role, stringifiedMember.bio, 
                 stringifiedMember.imageUrl, stringifiedMember.imageAlt, index]
            );
        }

        // 4. Synchronize Blog Posts
        const [dbBlogRows] = await connection.query('SELECT id FROM blog_posts');
        const dbBlogIds = new Set((dbBlogRows as any[]).map(r => r.id));
        const frontendBlogIds = new Set((content.blog || []).map(p => p.id));
        
        if (dbBlogIds.size > 0 && frontendBlogIds.size === 0) {
            throw new Error("SAFETY LOCK: An attempt to delete all blog posts was blocked.");
        }
        
        const blogIdsToDelete = [...dbBlogIds].filter(id => !frontendBlogIds.has(id));
        if (blogIdsToDelete.length > 0) {
            await connection.query('DELETE FROM blog_posts WHERE id IN (?)', [blogIdsToDelete]);
        }
        
        for (const post of (content.blog || [])) {
            const stringifiedPost = stringifyJsonFields(post, ['title', 'summary', 'content']);
            await connection.query(
                `INSERT INTO blog_posts (id, slug, title, author, date, summary, content, imageUrl, imageAlt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 slug = VALUES(slug), title = VALUES(title), author = VALUES(author), date = VALUES(date), 
                 summary = VALUES(summary), content = VALUES(content), imageUrl = VALUES(imageUrl), imageAlt = VALUES(imageAlt)`,
                [stringifiedPost.id, stringifiedPost.slug, stringifiedPost.title, stringifiedPost.author, stringifiedPost.date, 
                 stringifiedPost.summary, stringifiedPost.content, stringifiedPost.imageUrl, stringifiedPost.imageAlt]
            );
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