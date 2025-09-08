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
        const parsedProjects = parseJsonFields(projectsRows, ['title', 'description']).map((p: any) => ({
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

        // 4. Update Projects and Activities (Clear and re-insert)
        await connection.execute('DELETE FROM project_activities');
        await connection.execute('DELETE FROM projects');
        const insertProjectQuery = 'INSERT INTO projects (id, title, description, imageUrl, imageAlt, detailImageUrl, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const insertActivityQuery = 'INSERT INTO project_activities (id, date, title, description, imageUrl, project_id, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)';
        
        for (const [index, project] of content.projects.entries()) {
            const { activities, ...projectData } = project;
            const stringifiedProject = stringifyJsonFields(projectData, ['title', 'description']);
            await connection.execute(insertProjectQuery, [
                stringifiedProject.id, 
                stringifiedProject.title, 
                stringifiedProject.description, 
                stringifiedProject.imageUrl, 
                stringifiedProject.imageAlt, 
                stringifiedProject.detailImageUrl, 
                index
            ]);
            
            for(const [actIndex, activity] of activities.entries()) {
                 const stringifiedActivity = stringifyJsonFields(activity, ['title', 'description']);
                 await connection.execute(insertActivityQuery, [
                    stringifiedActivity.id,
                    stringifiedActivity.date,
                    stringifiedActivity.title,
                    stringifiedActivity.description,
                    stringifiedActivity.imageUrl,
                    project.id,
                    actIndex
                 ]);
            }
        }
        
        // 5. Update Team Members
        await connection.execute('DELETE FROM team_members');
        const insertTeamQuery = 'INSERT INTO team_members (id, name, role, bio, imageUrl, imageAlt, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)';
        for (const [index, member] of content.team.entries()) {
            const stringifiedMember = stringifyJsonFields(member, ['name', 'role', 'bio']);
            await connection.execute(insertTeamQuery, [
                stringifiedMember.id,
                stringifiedMember.name,
                stringifiedMember.role,
                stringifiedMember.bio,
                stringifiedMember.imageUrl,
                stringifiedMember.imageAlt,
                index
            ]);
        }

        // 6. Update Blog Posts
        await connection.execute('DELETE FROM blog_posts');
        const insertBlogQuery = 'INSERT INTO blog_posts (id, slug, title, author, date, summary, content, imageUrl, imageAlt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        for (const post of content.blog) {
             const stringifiedPost = stringifyJsonFields(post, ['title', 'summary', 'content']);
             await connection.execute(insertBlogQuery, [
                stringifiedPost.id,
                stringifiedPost.slug,
                stringifiedPost.title,
                stringifiedPost.author,
                stringifiedPost.date,
                stringifiedPost.summary,
                stringifiedPost.content,
                stringifiedPost.imageUrl,
                stringifiedPost.imageAlt
             ]);
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