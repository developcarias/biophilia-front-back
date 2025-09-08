
import * as ftp from 'basic-ftp';
// FIX: Import Buffer to resolve 'Cannot find name' error.
import { Buffer } from 'buffer';
import { Readable } from 'stream';
import { config } from '../config';

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

export async function listFiles() {
    const client = await getClient();
    try {
        await client.cd(config.ftp.basePath);
        const files = await client.list();
        return files
            .filter(file => file.type === ftp.FileType.File)
            .map(file => ({
                name: file.name,
                url: `https://biophiliaweb.org${config.ftp.basePath}/${file.name}`,
                size: file.size,
                modifiedAt: file.modifiedAt,
            }));
    } finally {
        client.close();
    }
}

export async function uploadFile(filename: string, buffer: Buffer) {
    const client = await getClient();
    try {
        const remotePath = `${config.ftp.basePath}/${filename}`;
        // FIX: The `uploadFrom` method requires a Readable stream. Convert the buffer to a stream.
        const readableStream = Readable.from(buffer);
        await client.uploadFrom(readableStream, remotePath);
    } finally {
        client.close();
    }
}

export async function deleteFile(filename: string) {
    const client = await getClient();
    try {
        const remotePath = `${config.ftp.basePath}/${filename}`;
        await client.remove(remotePath);
    } finally {
        client.close();
    }
}