const pool = require('../../../DB.js');

async function DBCategoriesINIT() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS Subjects(
        SubjectID BIGSERIAL PRIMARY KEY NOT NULL,
        Subject TEXT NOT NULL
    )`)
    
    await pool.query(`
    CREATE TABLE IF NOT EXISTS Levels(
        LevelID BIGSERIAL PRIMARY KEY NOT NULL,
        Level TEXT NOT NULL
    )`)
    
    await pool.query(`
    CREATE TABLE IF NOT EXISTS Subject_Level(
        SubjectID INTEGER NOT NULL,
        LevelID INTEGER NOT NULL,
    
        PRIMARY KEY (SubjectID, LevelID),
    
        FOREIGN KEY (SubjectID) REFERENCES Subjects(SubjectID),
        FOREIGN KEY (LevelID) REFERENCES Levels(LevelID)
    )`) //Certain Subjects only exist at certain Levels, e.g. Economics only exist from JC1 onwards
    
    await pool.query(`
    CREATE TABLE IF NOT EXISTS Assessments(
        AssessmentID BIGSERIAL PRIMARY KEY NOT NULL,
        AssessmentName TEXT NOT NULL
    )`)
    
    await pool.query(`
    CREATE TABLE IF NOT EXISTS Assessment_Level(
        AssessmentID INTEGER NOT NULL,
        LevelID INTEGER NOT NULL,
    
        PRIMARY KEY (AssessmentID, LevelID),
    
        FOREIGN KEY (AssessmentID) REFERENCES Assessments(AssessmentID),
        FOREIGN KEY (LevelID) REFERENCES Levels(LevelID)
    )`)
    
    await pool.query(`
    CREATE TABLE IF NOT EXISTS Topics(
        TopicID BIGSERIAL PRIMARY KEY NOT NULL,
        TopicName TEXT NOT NULL,
        SubjectID INTEGER NOT NULL,
    
        FOREIGN KEY (SubjectID) REFERENCES Subjects(SubjectID)
    )`)

    await pool.query(`
    CREATE TABLE IF NOT EXISTS Papers(
        PaperID BIGSERIAL PRIMARY KEY NOT NULL,
        Paper INTEGER NOT NULL
    )`)
    
    await pool.query(`
    CREATE TABLE IF NOT EXISTS Subject_Paper(
        SubjectID INTEGER NOT NULL,
        PaperID INTEGER NOT NULL,

        PRIMARY KEY (SubjectID, PaperID),
        
        FOREIGN KEY (SubjectID) REFERENCES Subjects(SubjectID),
        FOREIGN KEY (PaperID) REFERENCES Papers(PaperID)
    )`)

    await pool.query(`
    CREATE TABLE IF NOT EXISTS Schools(
        SchoolID BIGSERIAL PRIMARY KEY NOT NULL,
        SchoolName TEXT NOT NULL
    )`)

    await pool.query(`
    CREATE TABLE IF NOT EXISTS School_Subject(
        SchoolID INTEGER NOT NULL,
        SubjectID INTEGER NOT NULL,

        PRIMARY KEY (SchoolID, SubjectID),

        FOREIGN KEY (SchoolID) REFERENCES Schools(SchoolID),
        FOREIGN KEY (SubjectID) REFERENCES Subjects(SubjectID)
    )`)
}

module.exports = {DBCategoriesINIT}