import mysql from 'mysql2/promise';
import { config } from '../config';
import { PageContent, User, Project, TeamMember, BlogPost, ProjectActivity } from '../types';

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
        // 1. Update simple singleton tables (These are working)
        const globalData = stringifyJsonFields(content.global, ['navigation', 'socialLinks', 'footer']);
        await connection.execute('UPDATE global_content SET logoUrl = ?, navigation = ?, socialLinks = ?, footer = ? WHERE id = 1', [globalData.logoUrl, globalData.navigation, globalData.socialLinks, globalData.footer]);
        await connection.execute('UPDATE ui_text SET texts = ? WHERE id = 1', [JSON.stringify(content.ui)]);
        const pageKeys: (keyof PageContent)[] = ['homePage', 'aboutPage', 'projectsPage', 'projectDetailPage', 'teamPage', 'blogPage', 'contactPage', 'donatePage'];
        for (const pageKey of pageKeys) {
            if (content[pageKey]) {
                await connection.execute('UPDATE pages_content SET content = ? WHERE page_name = ?', [JSON.stringify(content[pageKey]), pageKey]);
            }
        }
        
        // --- Synchronization for Projects and Activities ---
        const incomingProjects = content.projects || [];
        const [dbProjectsResult] = await connection.query('SELECT id FROM projects');
        const dbProjectIds = new Set((dbProjectsResult as any[]).map(p => p.id));
        const incomingProjectIds = new Set(incomingProjects.map(p => p.id));
        
        const projectsToDelete = Array.from(dbProjectIds).filter(id => !incomingProjectIds.has(id));
        if (projectsToDelete.length > 0) {
            const placeholders = projectsToDelete.map(() => '?').join(',');
            await connection.query(`DELETE FROM project_activities WHERE project_id IN (${placeholders})`, projectsToDelete);
            await connection.query(`DELETE FROM projects WHERE id IN (${placeholders})`, projectsToDelete);
        }
        
        const incomingActivities = incomingProjects.flatMap(p => p.activities || []);
        const [dbActivitiesResult] = await connection.query('SELECT id FROM project_activities');
        const dbActivityIds = new Set((dbActivitiesResult as any[]).map(a => a.id));
        const incomingActivityIds = new Set(incomingActivities.map(a => a.id));

        const activitiesToDelete = Array.from(dbActivityIds).filter(id => !incomingActivityIds.has(id));
        if (activitiesToDelete.length > 0) {
            const placeholders = activitiesToDelete.map(() => '?').join(',');
            await connection.query(`DELETE FROM project_activities WHERE id IN (${placeholders})`, activitiesToDelete);
        }
        
        for (let index = 0; index < incomingProjects.length; index++) {
            const project = incomingProjects[index];
            const { activities, ...projectData } = project;
            const sp = stringifyJsonFields(projectData, ['title', 'description', 'detailDescription']);
            const upsertProjectSql = `
                INSERT INTO projects (id, title, description, detailDescription, imageUrl, imageAlt, detailImageUrl, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), detailDescription = VALUES(detailDescription), imageUrl = VALUES(imageUrl), imageAlt = VALUES(imageAlt), detailImageUrl = VALUES(detailImageUrl), display_order = VALUES(display_order)`;
            await connection.execute(upsertProjectSql, [sp.id, sp.title, sp.description, sp.detailDescription, sp.imageUrl, sp.imageAlt, sp.detailImageUrl, index]);

            const projectActivities = activities || [];
            for (let actIndex = 0; actIndex < projectActivities.length; actIndex++) {
                const activity = projectActivities[actIndex];
                const sa = stringifyJsonFields(activity, ['title', 'description']);
                const upsertActivitySql = `
                    INSERT INTO project_activities (id, date, title, description, imageUrl, project_id, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE date = VALUES(date), title = VALUES(title), description = VALUES(description), imageUrl = VALUES(imageUrl), project_id = VALUES(project_id), display_order = VALUES(display_order)`;
                await connection.execute(upsertActivitySql, [sa.id, sa.date, sa.title, sa.description, sa.imageUrl, project.id, actIndex]);
            }
        }
        
        // --- Synchronization for Team Members ---
        const incomingTeam = content.team || [];
        const [dbTeamResult] = await connection.query('SELECT id FROM team_members');
        const dbTeamIds = new Set((dbTeamResult as any[]).map(t => t.id));
        const incomingTeamIds = new Set(incomingTeam.map(t => t.id));
        
        const teamToDelete = Array.from(dbTeamIds).filter(id => !incomingTeamIds.has(id));
        if (teamToDelete.length > 0) {
            const placeholders = teamToDelete.map(() => '?').join(',');
            await connection.query(`DELETE FROM team_members WHERE id IN (${placeholders})`, teamToDelete);
        }
        
        for (let index = 0; index < incomingTeam.length; index++) {
            const member = incomingTeam[index];
            const sm = stringifyJsonFields(member, ['name', 'role', 'bio']);
            const upsertTeamSql = `
                INSERT INTO team_members (id, name, role, bio, imageUrl, imageAlt, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), bio = VALUES(bio), imageUrl = VALUES(imageUrl), imageAlt = VALUES(imageAlt), display_order = VALUES(display_order)`;
            await connection.execute(upsertTeamSql, [sm.id, sm.name, sm.role, sm.bio, sm.imageUrl, sm.imageAlt, index]);
        }

        // --- Synchronization for Blog Posts ---
        const incomingBlog = content.blog || [];
        const [dbBlogResult] = await connection.query('SELECT id FROM blog_posts');
        const dbBlogIds = new Set((dbBlogResult as any[]).map(p => p.id));
        const incomingBlogIds = new Set(incomingBlog.map(p => p.id));

        const blogToDelete = Array.from(dbBlogIds).filter(id => !incomingBlogIds.has(id));
        if (blogToDelete.length > 0) {
            const placeholders = blogToDelete.map(() => '?').join(',');
            await connection.query(`DELETE FROM blog_posts WHERE id IN (${placeholders})`, blogToDelete);
        }

        for (const post of incomingBlog) {
            const sp = stringifyJsonFields(post, ['title', 'summary', 'content']);
            const upsertBlogSql = `
                INSERT INTO blog_posts (id, slug, title, author, date, summary, content, imageUrl, imageAlt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE slug = VALUES(slug), title = VALUES(title), author = VALUES(author), date = VALUES(date), summary = VALUES(summary), content = VALUES(content), imageUrl = VALUES(imageUrl), imageAlt = VALUES(imageAlt)`;
            await connection.execute(upsertBlogSql, [sp.id, sp.slug, sp.title, sp.author, sp.date, sp.summary, sp.content, sp.imageUrl, sp.imageAlt]);
        }
        
        try {
            await connection.commit();
        } catch (commitError) {
            console.error("Failed to commit transaction. Rolling back.", commitError);
            await connection.rollback();
            throw commitError;
        }

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
    // In a real app, hash the password here before inserting
    const [result] = await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    const insertId = (result as any).insertId;
    return { id: insertId, username };
}

export async function updateUser(id: number, updates: Partial<User>): Promise<void> {
    const { username, password } = updates;
    // In a real app, hash the password if it's being updated
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