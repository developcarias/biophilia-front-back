
import * as ftp from 'basic-ftp';
import { Buffer } from 'buffer';
import { Readable } from 'stream';
import { config } from '../config';
import * as path from 'path';

async function getClient() {
    const client = new ftp.Client();
    // client.ftp.verbose = true; // for debugging
    await client.access({
        host: config.ftp.host,
        port: config.ftp.port,
        user: config.ftp.user,
        password: config.ftp.password,
        secure: config.ftp.secure
    });
    return client;
}

export async function listFiles(directoryPath = '/') {
    const client = await getClient();
    try {
        const fullPath = path.join(config.ftp.basePath, directoryPath).replace(/\\/g, '/');
        await client.cd(fullPath);
        const items = await client.list();

        const directories = items
            .filter(item => item.type === ftp.FileType.Directory && item.name !== '.' && item.name !== '..')
            .map(item => ({
                name: item.name,
                type: 'directory' as const,
            }));

        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.mp4', '.mov', '.webm'];
        const files = items
            .filter(file => file.type === ftp.FileType.File && allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext)))
            .map(file => ({
                name: file.name,
                url: `https://biophiliaweb.org${path.join(config.ftp.basePath, directoryPath, file.name).replace(/\\/g, '/')}`,
                size: file.size,
                modifiedAt: file.modifiedAt,
                type: 'file' as const,
            }));

        return { directories, files };
    } finally {
        client.close();
    }
}

export async function createDirectory(newDirectoryPath: string) {
    const client = await getClient();
    try {
        const fullPath = path.join(config.ftp.basePath, newDirectoryPath).replace(/\\/g, '/');
        await client.ensureDir(fullPath);
    } finally {
        client.close();
    }
}

export async function uploadFile(directoryPath: string, filename: string, buffer: Buffer) {
    const client = await getClient();
    try {
        const remotePath = path.join(config.ftp.basePath, directoryPath, filename).replace(/\\/g, '/');
        const readableStream = Readable.from(buffer);
        await client.uploadFrom(readableStream, remotePath);
    } finally {
        client.close();
    }
}

export async function deleteFile(directoryPath: string, filename: string) {
    const client = await getClient();
    try {
        const remotePath = path.join(config.ftp.basePath, directoryPath, filename).replace(/\\/g, '/');
        await client.remove(remotePath);
    } finally {
        client.close();
    }
}

export async function deleteDirectory(directoryPath: string) {
    const client = await getClient();
    try {
        const fullPath = path.join(config.ftp.basePath, directoryPath).replace(/\\/g, '/');
        // Navigate into the directory, clear all its contents, go back up, and remove the empty dir.
        await client.cd(fullPath);
        await client.clearWorkingDir();
        await client.cd("..");
        await client.removeDir(path.basename(fullPath));
    } finally {
        client.close();
    }
}
