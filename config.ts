
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: 'biophiliauserdb',
    password: process.env.NODE_ENV === 'prod' ? 'i+QJL&^]9N)6' : 'Sv..6242',
    database: 'biophiliadb'
  },
  ftp: {
    host: 'biophiliaweb.org',
    port: 21,
    user: 'bioftp@biophiliaweb.org',
    password: 'O7MdHYM$e]rr',
    secure: false,
    basePath: '/images' // Assuming images are in a subdirectory
  },
  smtp: {
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true,
    auth: {
      user: 'admin@biophiliaweb.org',
      pass: 'Svs..6242'
    }
  },
  server: {
    port: process.env.PORT || 3001,
  }
};
