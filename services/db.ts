
import mysql from 'mysql2/promise';
import { config } from '../config';
import { PageContent } from '../types';

const pool = mysql.createPool(config.db);

export async function getContent(): Promise<PageContent> {
    const connection = await pool.getConnection();
    try {
        const [globalRows] = await connection.query('SELECT * FROM global_content WHERE id = 1');
        const [uiRows] = await connection.query('SELECT * FROM ui_text WHERE id = 1');
        const [pagesRows] = await connection.query('SELECT * FROM pages_content');
        const [projectsRows] = await connection.query('SELECT * FROM projects ORDER BY display_order ASC');
        const [teamRows] = await connection.query('SELECT * FROM team_members ORDER BY display_order ASC');
        const [blogRows] = await connection.query('SELECT * FROM blog_posts ORDER BY date DESC');
        
        // This is a complex operation to fetch all activities and map them to their projects
        const allActivities = await connection.query('SELECT * FROM project_activities ORDER BY display_order ASC');
        const projects = (projectsRows as any[]).map(p => {
            return {
                ...p,
                activities: (allActivities[0] as any[]).filter(a => a.project_id === p.id)
            }
        });

        const pagesContent: any = {};
        (pagesRows as any[]).forEach(row => {
            pagesContent[row.page_name] = row.content;
        });

        return {
            global: (globalRows as any)[0],
            ui: (uiRows as any)[0].texts,
            homePage: pagesContent.homePage,
            aboutPage: pagesContent.aboutPage,
            projectsPage: pagesContent.projectsPage,
            projectDetailPage: pagesContent.projectDetailPage,
            teamPage: pagesContent.teamPage,
            blogPage: pagesContent.blogPage,
            contactPage: pagesContent.contactPage,
            donatePage: pagesContent.donatePage,
            projects,
            team: teamRows as any,
            blog: blogRows as any,
        };
    } finally {
        connection.release();
    }
}

export async function updateContent(content: PageContent): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // Update simple tables
        await connection.execute('UPDATE global_content SET ? WHERE id = 1', [content.global]);
        await connection.execute('UPDATE ui_text SET texts = ? WHERE id = 1', [JSON.stringify(content.ui)]);

        // Update pages
        for (const key of Object.keys(content).filter(k => k.endsWith('Page'))) {
            const pageKey = key as keyof PageContent;
            await connection.execute('UPDATE pages_content SET content = ? WHERE page_name = ?', [JSON.stringify(content[pageKey]), pageKey]);
        }

        // Update complex lists (Projects, Team, Blog) - This is a simplified version.
        // A more robust solution would handle adds/deletes/updates individually.
        // For now, we clear and re-insert which is simpler but less efficient.
        
        // Projects and Activities
        await connection.execute('DELETE FROM project_activities');
        await connection.execute('DELETE FROM projects');
        for (const [index, project] of content.projects.entries()) {
            await connection.execute('INSERT INTO projects (id, title, description, imageUrl, imageAlt, detailImageUrl, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                [project.id, JSON.stringify(project.title), JSON.stringify(project.description), project.imageUrl, project.imageAlt, project.detailImageUrl, index]);
            for(const [actIndex, activity] of project.activities.entries()) {
                 await connection.execute('INSERT INTO project_activities (id, project_id, date, title, description, imageUrl, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [activity.id, project.id, activity.date, JSON.stringify(activity.title), JSON.stringify(activity.description), activity.imageUrl, actIndex]);
            }
        }
        
        // Team Members
        await connection.execute('DELETE FROM team_members');
        for (const [index, member] of content.team.entries()) {
            await connection.execute('INSERT INTO team_members (id, name, role, bio, imageUrl, imageAlt, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [member.id, JSON.stringify(member.name), JSON.stringify(member.role), JSON.stringify(member.bio), member.imageUrl, member.imageAlt, index]);
        }

        // Blog Posts
        await connection.execute('DELETE FROM blog_posts');
        for (const post of content.blog) {
             await connection.execute('INSERT INTO blog_posts (id, slug, title, author, date, summary, content, imageUrl, imageAlt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [post.id, post.slug, JSON.stringify(post.title), post.author, post.date, JSON.stringify(post.summary), JSON.stringify(post.content), post.imageUrl, post.imageAlt]);
        }
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
