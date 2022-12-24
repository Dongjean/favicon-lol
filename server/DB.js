const Pool = require('pg').Pool;
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    user: process.env.PGUser,
    password: process.env.PGPW,
    host: 'localhost',
    port: process.env.PGPort,
    database: process.env.PGDBName,
});

module.exports = pool;