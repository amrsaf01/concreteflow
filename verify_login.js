
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'server/db.json');

async function testLogin() {
    try {
        console.log('Reading DB from:', DB_PATH);
        const dataStr = await fs.readFile(DB_PATH, 'utf-8');
        const data = JSON.parse(dataStr);

        console.log('Users found:', data.users?.length);

        const username = 'admin';
        const password = 'admin123';

        const user = data.users?.find(u => u.username === username && u.password === password);

        if (user) {
            console.log('SUCCESS: User found!', user.username);
        } else {
            console.log('FAILURE: User not found.');
            console.log('Searching for username:', username);
            const userByName = data.users?.find(u => u.username === username);
            if (userByName) {
                console.log('User exists but password mismatch.');
                console.log('Stored password:', userByName.password);
                console.log('Provided password:', password);
                console.log('Equal?', userByName.password === password);
                console.log('Stored length:', userByName.password.length);
                console.log('Provided length:', password.length);
            } else {
                console.log('User does not exist.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();
