import mysql from 'mysql2/promise';
import { config } from '../config';
import { PageContent } from '../types';

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
            pagesContent[row.page_name] = JSON.parse(row.content || '{}');
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
        await connection.execute('UPDATE global_content SET ? WHERE id = 1', [globalData]);

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
        for (const [index, project] of content.projects.entries()) {
            const { activities, ...projectData } = project;
            const stringifiedProject = stringifyJsonFields(projectData, ['title', 'description']);
            await connection.execute('INSERT INTO projects SET ?', [{ ...stringifiedProject, display_order: index }]);
            
            for(const [actIndex, activity] of activities.entries()) {
                 const stringifiedActivity = stringifyJsonFields(activity, ['title', 'description']);
                 await connection.execute('INSERT INTO project_activities SET ?', [{ ...stringifiedActivity, project_id: project.id, display_order: actIndex }]);
            }
        }
        
        // 5. Update Team Members
        await connection.execute('DELETE FROM team_members');
        for (const [index, member] of content.team.entries()) {
            const stringifiedMember = stringifyJsonFields(member, ['name', 'role', 'bio']);
            await connection.execute('INSERT INTO team_members SET ?', [{ ...stringifiedMember, display_order: index }]);
        }

        // 6. Update Blog Posts
        await connection.execute('DELETE FROM blog_posts');
        for (const post of content.blog) {
             const stringifiedPost = stringifyJsonFields(post, ['title', 'summary', 'content']);
             await connection.execute('INSERT INTO blog_posts SET ?', [stringifiedPost]);
        }
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
