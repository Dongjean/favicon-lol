const pool = require('../DB.js');
const fs = require('fs');

const {Pay} = require('../utils/PaymentHandler.js');

//Get

async function Get_Questions_Filtered(Categories) {
    try {
        const result = await pool.query(`
            SELECT
                Questions.QuestionID,
                Users.FirstName, Users.LastName,
                Topics.TopicID, Topics.TopicName,
                Papers.PaperID, Papers.Paper,
                Levels.LevelID, Levels.Level,
                Assessments.AssessmentID, Assessments.AssessmentName,
                Schools.SchoolID, Schools.SchoolName

            FROM Questions JOIN Users
                ON Users.Email = Questions.Email
            JOIN Topics
                ON Topics.TopicID = Questions.TopicID
            JOIN Papers
                ON Papers.PaperID = Questions.PaperID
            JOIN Levels
                ON Levels.LevelID = Questions.LevelID
            JOIN Assessments
                ON Assessments.AssessmentID = Questions.AssessmentID
            JOIN Schools
                ON Schools.SchoolID = Questions.SchoolID

            LEFT JOIN Upvotes
                ON Upvotes.QuestionID = Questions.QuestionID

            WHERE
                Questions.TopicID=ANY($1::int[]) AND
                Questions.PaperID=ANY($2::int[]) AND
                Questions.LevelID=ANY($3::int[]) AND
                Questions.AssessmentID=ANY($4::int[]) AND
                Questions.SchoolID=ANY($5::int[]) AND

                Questions.isActive=TRUE

        GROUP BY
            Upvotes.QuestionID,
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName
        
        ORDER BY Count(Upvotes.Email) DESC
        `, [Categories.Topics, Categories.Papers, Categories.Levels, Categories.Assessments, Categories.Schools]) //Get all Questions for the Categories queried
        const Questions = result.rows
        console.log(Questions)

        var QuestionImages = [];
        for (var i=0; i<Questions.length; i++) {
            const Question = Questions[i]

             //get the first Question Image only related to this Question from DB
            const QNresult = (await pool.query(`
            SELECT QuestionIMGID, QuestionIMGName, QuestionIMGDIR, QuestionID
            FROM QuestionIMGs
            WHERE QuestionID=$1
            LIMIT 1
            `, [Question.questionid])).rows[0]

            //get Image Data from the Image Directory for the first Image for this Question
            const QNIMGData = (await fs.promises.readFile(QNresult.questionimgdir)).toString('base64')
            QuestionImages.push({
                QuestionIMGID: QNresult.questionimgid,
                QuestionIMGName: QNresult.questionimgname,
                QuestionIMGData: QNIMGData,
                QuestionID: QNresult.questionid
            })
        }

        const Data = {
            Questions: Questions,
            QuestionImages: QuestionImages
        }
        return Data
    } catch(err) {
        console.log(err)
    }
}

async function Get_QuestionData_fromQuestionID(QuestionID) {
    try {
        const result = await pool.query(`
        SELECT
            Questions.QuestionID, Questions.isActive,
            Users.FirstName, Users.LastName, Users.Email,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName

        FROM Questions JOIN Users
            ON Questions.Email = Users.Email
        JOIN Topics
            ON Topics.TopicID = Questions.TopicID
        JOIN Papers
            ON Papers.PaperID = Questions.PaperID
        JOIN Levels
            ON Levels.LevelID = Questions.LevelID
        JOIN Assessments
            ON Assessments.AssessmentID = Questions.AssessmentID
        JOIN Schools
            ON Schools.SchoolID = Questions.SchoolID

        WHERE
            Questions.QuestionID=$1
        `, [QuestionID]) //Get all Questions for the Categories queried
        const Question = result.rows[0]
        console.log(Question)

        var QuestionImages = [];
        var AnswerImages = [];

        //get all Question Images related to this Question from DB
        const QNresult = await pool.query(`
        SELECT QuestionIMGID, QuestionIMGName, QuestionIMGDIR, QuestionID
        FROM QuestionIMGs
        WHERE QuestionID=$1
        `, [QuestionID])

        //get Image Data from the Image Directory for all Images for this Question
        for (var j=0; j<QNresult.rows.length; j++) {
            const QNIMGData = (await fs.promises.readFile(QNresult.rows[j].questionimgdir)).toString('base64')
            QuestionImages.push({
                QuestionIMGID: QNresult.rows[j].questionimgid,
                QuestionIMGName: QNresult.rows[j].questionimgname,
                QuestionIMGData: QNIMGData,
                QuestionID: QNresult.rows[j].questionid
            })
        }

        //get all Answer Images related to this Question from DB
        const ANSresult = await pool.query(`
        SELECT AnswerIMGID, AnswerIMGName, AnswerIMGDIR, QuestionID
        FROM AnswerIMGs
        WHERE QuestionID=$1
        `, [QuestionID])

        //get Image Data from the Image Directory for all Images for this Question
        for (var j=0; j<ANSresult.rows.length; j++) {
            const ANSIMGData = (await fs.promises.readFile(ANSresult.rows[j].answerimgdir)).toString('base64')
            AnswerImages.push({
                AnswerIMGID: ANSresult.rows[j].answerimgid,
                AnswerIMGName: ANSresult.rows[j].answerimgname,
                AnswerIMGData: ANSIMGData,
                QuestionID: ANSresult.rows[j].questionid
            })
        }

        const Data = {
            Question: Question,
            QuestionImages: QuestionImages,
            AnswerImages: AnswerImages
        }
        return Data
    } catch(err) {
        console.log(err)
    }
}

async function Get_Questions_Saved_All(Email) {
    try {
        const result = await pool.query(`
        SELECT
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName

        FROM Questions JOIN Users
            ON Questions.Email = Users.Email
        JOIN Topics
            ON Topics.TopicID = Questions.TopicID
        JOIN Papers
            ON Papers.PaperID = Questions.PaperID
        JOIN Levels
            ON Levels.LevelID = Questions.LevelID
        JOIN Assessments
            ON Assessments.AssessmentID = Questions.AssessmentID
        JOIN Schools
            ON Schools.SchoolID = Questions.SchoolID
        
        JOIN SavedQuestions
            ON SavedQuestions.QuestionID = Questions.QuestionID

        LEFT JOIN Upvotes
            ON Upvotes.QuestionID = Questions.QuestionID
            
        WHERE
            SavedQuestions.Email = $1 AND
            
            Questions.isActive=TRUE
        
        GROUP BY
            Upvotes.QuestionID,
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName
        
        ORDER BY Count(Upvotes.Email) DESC
        `, [Email])
        const Questions = result.rows
        console.log(Questions)

        var QuestionImages = [];
        for (var i=0; i<Questions.length; i++) {
            const Question = Questions[i]

            //get the first Question Image only related to this Question from DB
            const QNresult = (await pool.query(`
            SELECT QuestionIMGID, QuestionIMGName, QuestionIMGDIR, QuestionID
            FROM QuestionIMGs
            WHERE QuestionID=$1
            LIMIT 1
            `, [Question.questionid])).rows[0]
            console.log(QNresult.rows)

            //get Image Data from the Image Directory for the first Image for this Question
            const QNIMGData = (await fs.promises.readFile(QNresult.questionimgdir)).toString('base64')
            QuestionImages.push({
                QuestionIMGID: QNresult.questionimgid,
                QuestionIMGName: QNresult.questionimgname,
                QuestionIMGData: QNIMGData,
                QuestionID: QNresult.questionid
            })
        }

        const Data = {
            Questions: Questions,
            QuestionImages: QuestionImages
        }
        
        return Data
    } catch(err) {
        console.log(err)
    }
}

async function Get_Questions_Saved_Filtered(Email, Categories) {
    try {
        const result = await pool.query(`
        SELECT
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName

        FROM Questions JOIN Users
            ON Users.Email = Questions.Email
        JOIN Topics
            ON Topics.TopicID = Questions.TopicID
        JOIN Papers
            ON Papers.PaperID = Questions.PaperID
        JOIN Levels
            ON Levels.LevelID = Questions.LevelID
        JOIN Assessments
            ON Assessments.AssessmentID = Questions.AssessmentID
        JOIN Schools
            ON Schools.SchoolID = Questions.SchoolID

        JOIN SavedQuestions
            ON SavedQuestions.QuestionID = Questions.QuestionID

        LEFT JOIN Upvotes
            ON Upvotes.QuestionID = Questions.QuestionID

        WHERE
            Questions.TopicID=ANY($1::int[]) AND
            Questions.PaperID=ANY($2::int[]) AND
            Questions.LevelID=ANY($3::int[]) AND
            Questions.AssessmentID=ANY($4::int[]) AND
            Questions.SchoolID=ANY($5::int[]) AND
            
            SavedQuestions.Email=$6 AND

            Questions.isActive=TRUE
        
        GROUP BY
            Upvotes.QuestionID,
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName
        
        ORDER BY Count(Upvotes.Email) DESC
        `, [Categories.Topics, Categories.Papers, Categories.Levels, Categories.Assessments, Categories.Schools, Email]) //Get all Questions for the Categories queried
        const Questions = result.rows
        console.log(Questions)

        var QuestionImages = [];
        for (var i=0; i<Questions.length; i++) {
            const Question = Questions[i]

             //get the first Question Image only related to this Question from DB
            const QNresult = (await pool.query(`
            SELECT QuestionIMGID, QuestionIMGName, QuestionIMGDIR, QuestionID
            FROM QuestionIMGs
            WHERE QuestionID=$1
            LIMIT 1
            `, [Question.questionid])).rows[0]

            //get Image Data from the Image Directory for the first Image for this Question
            const QNIMGData = (await fs.promises.readFile(QNresult.questionimgdir)).toString('base64')
            QuestionImages.push({
                QuestionIMGID: QNresult.questionimgid,
                QuestionIMGName: QNresult.questionimgname,
                QuestionIMGData: QNIMGData,
                QuestionID: QNresult.questionid
            })
        }

        const Data = {
            Questions: Questions,
            QuestionImages: QuestionImages
        }
        return Data
    } catch(err) {
        console.log(err)
    }

}

async function Get_Questions_fromAuthor(Email) {
    try {
        const result = await pool.query(`
        SELECT
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName

        FROM Questions JOIN Users
            ON Questions.Email = Users.Email
        JOIN Topics
            ON Topics.TopicID = Questions.TopicID
        JOIN Papers
            ON Papers.PaperID = Questions.PaperID
        JOIN Levels
            ON Levels.LevelID = Questions.LevelID
        JOIN Assessments
            ON Assessments.AssessmentID = Questions.AssessmentID
        JOIN Schools
            ON Schools.SchoolID = Questions.SchoolID

        WHERE
            Users.Email=$1
        `, [Email]) //Get all Questions for the Categories queried
        const Questions = result.rows
        console.log(Questions)

        var QuestionImages = [];
        for (var i=0; i<Questions.length; i++) {
            const Question = Questions[i]

            //get the first Question Image only related to this Question from DB
            const QNresult = (await pool.query(`
            SELECT QuestionIMGID, QuestionIMGName, QuestionIMGDIR, QuestionID
            FROM QuestionIMGs
            WHERE QuestionID=$1
            LIMIT 1
            `, [Question.questionid])).rows[0]

            //get Image Data from the Image Directory for the first Image for this Question
            const QNIMGData = (await fs.promises.readFile(QNresult.questionimgdir)).toString('base64')
            QuestionImages.push({
                QuestionIMGID: QNresult.questionimgid,
                QuestionIMGName: QNresult.questionimgname,
                QuestionIMGData: QNIMGData,
                QuestionID: QNresult.questionid
            })
        }

        const Data = {
            Questions: Questions,
            QuestionImages: QuestionImages
        }
        return Data

    } catch(err) {
        console.log(err)
    }
}

async function Get_Questions_Completed_All(Email) {
    try {
        const result = await pool.query(`
        SELECT
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName

        FROM Questions JOIN Users
            ON Questions.Email = Users.Email
        JOIN Topics
            ON Topics.TopicID = Questions.TopicID
        JOIN Papers
            ON Papers.PaperID = Questions.PaperID
        JOIN Levels
            ON Levels.LevelID = Questions.LevelID
        JOIN Assessments
            ON Assessments.AssessmentID = Questions.AssessmentID
        JOIN Schools
            ON Schools.SchoolID = Questions.SchoolID
        
        JOIN CompletedQuestions
            ON CompletedQuestions.QuestionID = Questions.QuestionID

        LEFT JOIN Upvotes
            ON Upvotes.QuestionID = Questions.QuestionID
            
        WHERE
            CompletedQuestions.Email = $1 AND

            Questions.isActive=TRUE
        
        GROUP BY
            Upvotes.QuestionID,
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName
        
        ORDER BY Count(Upvotes.Email) DESC
        `, [Email])
        const Questions = result.rows
        console.log(Questions)

        var QuestionImages = [];
        for (var i=0; i<Questions.length; i++) {
            const Question = Questions[i]

            //get the first Question Image only related to this Question from DB
            const QNresult = (await pool.query(`
            SELECT QuestionIMGID, QuestionIMGName, QuestionIMGDIR, QuestionID
            FROM QuestionIMGs
            WHERE QuestionID=$1
            LIMIT 1
            `, [Question.questionid])).rows[0]
            console.log(QNresult.rows)

            //get Image Data from the Image Directory for the first Image for this Question
            const QNIMGData = (await fs.promises.readFile(QNresult.questionimgdir)).toString('base64')
            QuestionImages.push({
                QuestionIMGID: QNresult.questionimgid,
                QuestionIMGName: QNresult.questionimgname,
                QuestionIMGData: QNIMGData,
                QuestionID: QNresult.questionid
            })
        }

        const Data = {
            Questions: Questions,
            QuestionImages: QuestionImages
        }
        
        return Data
    } catch(err) {
        console.log(err)
    }
}

async function Get_Questions_Completed_Filtered(Email, Categories) {
    try {
        const result = await pool.query(`
        SELECT
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName

        FROM Questions JOIN Users
            ON Users.Email = Questions.Email
        JOIN Topics
            ON Topics.TopicID = Questions.TopicID
        JOIN Papers
            ON Papers.PaperID = Questions.PaperID
        JOIN Levels
            ON Levels.LevelID = Questions.LevelID
        JOIN Assessments
            ON Assessments.AssessmentID = Questions.AssessmentID
        JOIN Schools
            ON Schools.SchoolID = Questions.SchoolID

        JOIN CompletedQuestions
            ON CompletedQuestions.QuestionID = Questions.QuestionID

        LEFT JOIN Upvotes
            ON Upvotes.QuestionID = Questions.QuestionID

        WHERE
            Questions.TopicID=ANY($1::int[]) AND
            Questions.PaperID=ANY($2::int[]) AND
            Questions.LevelID=ANY($3::int[]) AND
            Questions.AssessmentID=ANY($4::int[]) AND
            Questions.SchoolID=ANY($5::int[]) AND
            
            CompletedQuestions.Email=$6 AND

            Questions.isActive=TRUE

        GROUP BY
            Upvotes.QuestionID,
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName
        
        ORDER BY Count(Upvotes.Email) DESC
        `, [Categories.Topics, Categories.Papers, Categories.Levels, Categories.Assessments, Categories.Schools, Email]) //Get all Questions for the Categories queried
        const Questions = result.rows
        console.log(Questions)

        var QuestionImages = [];
        for (var i=0; i<Questions.length; i++) {
            const Question = Questions[i]

             //get the first Question Image only related to this Question from DB
            const QNresult = (await pool.query(`
            SELECT QuestionIMGID, QuestionIMGName, QuestionIMGDIR, QuestionID
            FROM QuestionIMGs
            WHERE QuestionID=$1
            LIMIT 1
            `, [Question.questionid])).rows[0]

            //get Image Data from the Image Directory for the first Image for this Question
            const QNIMGData = (await fs.promises.readFile(QNresult.questionimgdir)).toString('base64')
            QuestionImages.push({
                QuestionIMGID: QNresult.questionimgid,
                QuestionIMGName: QNresult.questionimgname,
                QuestionIMGData: QNIMGData,
                QuestionID: QNresult.questionid
            })
        }

        const Data = {
            Questions: Questions,
            QuestionImages: QuestionImages
        }
        return Data
    } catch(err) {
        console.log(err)
    }
}

async function Get_Reports_All() {
    try {
        const result = await pool.query(`
        SELECT Users.FirstName, Users.LastName, Reports.ReportID, Reports.ReportText, Reports.QuestionID
        FROM Users JOIN Reports
        ON Users.Email = Reports.Email
        `)

        return result.rows
    } catch(err) {
        console.log(err)
    }
}

async function Get_Payments_Pending_All() {
    try {
        const result = await pool.query(`
        SELECT COUNT(QuestionID) AS PaymentCount, Email
        FROM PendingPayments
        GROUP BY Email
        `)

        return result.rows
    } catch(err) {
        console.log(err)
    }
}

async function Get_Upvotes_Count_fromQuestionID(QuestionID) {
    try {
        const result = await pool.query(`
        SELECT COUNT(QuestionID) AS UpvotesCount
        FROM UPVOTES
        WHERE QuestionID=$1
        `, [QuestionID])

        return parseInt(result.rows[0].upvotescount)
    } catch(err) {
        console.log(err)
    }
}

async function Get_Author_fromQuestionID(QuestionID) {
    try {
        const result = await pool.query(`
        SELECT Users.Email
        FROM Questions JOIN Users
        ON Questions.Email = Users.Email
        WHERE Questions.QuestionID=$1
        `, [QuestionID])

        if (result.rows[0]) {
            return result.rows[0].email
        }
    } catch(err) {
        console.log(err)
    }
}

async function Get_QuestionData_toEdit_fromQuestionID(QuestionID) {
    try {
        const CategoriesResult = await pool.query(`
        SELECT
            Subjects.SubjectID,
            Questions.TopicID,
            Questions.PaperID,
            Questions.LevelID,
            Questions.AssessmentID,
            Questions.SchoolID

        FROM Questions JOIN Topics
            ON Topics.TopicID = Questions.TopicID
        
        JOIN Subjects
            ON Subjects.SubjectID = Topics.SubjectID

        WHERE
            Questions.QuestionID=$1
        `, [QuestionID])

        const QNImagesResult = await pool.query(`
        SELECT QuestionIMGID, QuestionIMGName, QuestionIMGDIR
        FROM QuestionIMGs
        WHERE QuestionID=$1
        `, [QuestionID])
        const QuestionImagesRows = QNImagesResult.rows

        const ANSImagesResult = await pool.query(`
        SELECT AnswerIMGID, AnswerIMGName, AnswerIMGDIR
        FROM AnswerIMGs
        WHERE QuestionID=$1
        `, [QuestionID])
        const AnswerImagesRows = ANSImagesResult.rows

        var QuestionImages = []
        for (var i=0; i<QuestionImagesRows.length; i++) {
            //get Image Data from the Image Directory for the Question Images for this Question
            const QNIMGData = (await fs.promises.readFile(QuestionImagesRows[i].questionimgdir)).toString('base64')
            QuestionImages.push({
                QuestionIMGID: QuestionImagesRows[i].questionimgid,
                FileName: QuestionImagesRows[i].questionimgname,
                OriginalIMGData: 'data:image/png;base64,' + QNIMGData
            })
        }

        var AnswerImages = []
        for (var i=0; i<AnswerImagesRows.length; i++) {
            //get Image Data from the Image Directory for the Answer Images for this Question
            const ANSIMGData = (await fs.promises.readFile(AnswerImagesRows[i].answerimgdir)).toString('base64')
            AnswerImages.push({
                AnswerIMGID: AnswerImagesRows[i].answerimgid,
                FileName: AnswerImagesRows[i].answerimgname,
                OriginalIMGData: 'data:image/png;base64,' + ANSIMGData
            })
        }

        return {
            Categories: CategoriesResult.rows[0],
            QuestionImages: QuestionImages,
            AnswerImages: AnswerImages
        }
    } catch(err) {
        console.log(err)
    }
}

async function Get_Questions_Deactivated_All() {
    try {
        const result = await pool.query(`
        SELECT
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName

        FROM Questions JOIN Users
            ON Questions.Email = Users.Email
        JOIN Topics
            ON Topics.TopicID = Questions.TopicID
        JOIN Papers
            ON Papers.PaperID = Questions.PaperID
        JOIN Levels
            ON Levels.LevelID = Questions.LevelID
        JOIN Assessments
            ON Assessments.AssessmentID = Questions.AssessmentID
        JOIN Schools
            ON Schools.SchoolID = Questions.SchoolID

        LEFT JOIN Upvotes
            ON Upvotes.QuestionID = Questions.QuestionID
            
        WHERE
            Questions.isActive=FALSE
        
        GROUP BY
            Upvotes.QuestionID,
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName
        
        ORDER BY Count(Upvotes.Email) DESC
        `)
        const Questions = result.rows

        var QuestionImages = [];
        for (var i=0; i<Questions.length; i++) {
            const Question = Questions[i]

            //get the first Question Image only related to this Question from DB
            const QNresult = (await pool.query(`
            SELECT QuestionIMGID, QuestionIMGName, QuestionIMGDIR, QuestionID
            FROM QuestionIMGs
            WHERE QuestionID=$1
            LIMIT 1
            `, [Question.questionid])).rows[0]

            //get Image Data from the Image Directory for the first Image for this Question
            const QNIMGData = (await fs.promises.readFile(QNresult.questionimgdir)).toString('base64')
            QuestionImages.push({
                QuestionIMGID: QNresult.questionimgid,
                QuestionIMGName: QNresult.questionimgname,
                QuestionIMGData: QNIMGData,
                QuestionID: QNresult.questionid
            })
        }

        const Data = {
            Questions: Questions,
            QuestionImages: QuestionImages
        }
        
        return Data
    } catch(err) {
        console.log(err)
    }
}

async function Get_Questions_Deactivated_Filtered(Categories) {
    try {
        const result = await pool.query(`
        SELECT
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName

        FROM Questions JOIN Users
            ON Users.Email = Questions.Email
        JOIN Topics
            ON Topics.TopicID = Questions.TopicID
        JOIN Papers
            ON Papers.PaperID = Questions.PaperID
        JOIN Levels
            ON Levels.LevelID = Questions.LevelID
        JOIN Assessments
            ON Assessments.AssessmentID = Questions.AssessmentID
        JOIN Schools
            ON Schools.SchoolID = Questions.SchoolID

        LEFT JOIN Upvotes
            ON Upvotes.QuestionID = Questions.QuestionID

        WHERE
            Questions.TopicID=ANY($1::int[]) AND
            Questions.PaperID=ANY($2::int[]) AND
            Questions.LevelID=ANY($3::int[]) AND
            Questions.AssessmentID=ANY($4::int[]) AND
            Questions.SchoolID=ANY($5::int[]) AND

            Questions.isActive=FALSE

        GROUP BY
            Upvotes.QuestionID,
            Questions.QuestionID,
            Users.FirstName, Users.LastName,
            Topics.TopicID, Topics.TopicName,
            Papers.PaperID, Papers.Paper,
            Levels.LevelID, Levels.Level,
            Assessments.AssessmentID, Assessments.AssessmentName,
            Schools.SchoolID, Schools.SchoolName
        
        ORDER BY Count(Upvotes.Email) DESC
        `, [Categories.Topics, Categories.Papers, Categories.Levels, Categories.Assessments, Categories.Schools]) //Get all Questions for the Categories queried
        const Questions = result.rows
        console.log(Questions)

        var QuestionImages = [];
        for (var i=0; i<Questions.length; i++) {
            const Question = Questions[i]

             //get the first Question Image only related to this Question from DB
            const QNresult = (await pool.query(`
            SELECT QuestionIMGID, QuestionIMGName, QuestionIMGDIR, QuestionID
            FROM QuestionIMGs
            WHERE QuestionID=$1
            LIMIT 1
            `, [Question.questionid])).rows[0]

            //get Image Data from the Image Directory for the first Image for this Question
            const QNIMGData = (await fs.promises.readFile(QNresult.questionimgdir)).toString('base64')
            QuestionImages.push({
                QuestionIMGID: QNresult.questionimgid,
                QuestionIMGName: QNresult.questionimgname,
                QuestionIMGData: QNIMGData,
                QuestionID: QNresult.questionid
            })
        }

        const Data = {
            Questions: Questions,
            QuestionImages: QuestionImages
        }
        return Data
    } catch(err) {
        console.log(err)
    }
}


//Check

async function Check_Question_isSaved(QuestionID, Email) {
    try {
        const result = await pool.query(`
        SELECT * FROM SavedQuestions WHERE QuestionID=$1 AND Email=$2
        `, [QuestionID, Email])
        return result.rows.length !== 0
    } catch(err) {
        console.log(err)
    }
}

async function Check_Question_isCompleted(QuestionID, Email) {
    try {
        const result = await pool.query(`
        SELECT * FROM CompletedQuestions WHERE QuestionID=$1 AND Email=$2
        `, [QuestionID, Email])
        return result.rows.length !== 0
    } catch(err) {
        console.log(err)
    }
}

async function Check_Question_isActive(QuestionID) {
    try {
        const result = await pool.query(`
        SELECT isActive, Email
        FROM Questions
        WHERE QuestionID=$1
        `, [QuestionID])

        return result.rows[0]
    } catch(err) {
        console.log(err)
    }
}

async function Check_Question_isUpvoted(QuestionID, Email) {
    try {
        const result = await pool.query(`
        SELECT * FROM Upvotes
        WHERE QuestionID=$1 AND Email=$2
        `, [QuestionID, Email])

        return result.rows.length !== 0
    } catch(err) {
        console.log(err)
    }
}


//Saved

async function Save_Question(QuestionID, Email) {
    try {
        await pool.query(`
        INSERT INTO SavedQuestions VALUES($1, $2)
        `, [QuestionID, Email])
    } catch(err) {
        console.log(err)
    }
}

async function unSave_Question(QuestionID, Email) {
    try {
        await pool.query(`
        DELETE FROM SavedQuestions WHERE QuestionID=$1 AND Email=$2
        `, [QuestionID, Email])
    } catch(err) {
        console.log(err)
    }
}


//Completed

async function Complete_Question(QuestionID, Email) {
    try {
        await pool.query(`
        INSERT INTO CompletedQuestions VALUES($1, $2)
        `, [QuestionID, Email])
    } catch(err) {
        console.log(err)
    }
}

async function Uncomplete_Question(QuestionID, Email) {
    try {
        await pool.query(`
        DELETE FROM CompletedQuestions WHERE QuestionID=$1 AND Email=$2
        `, [QuestionID, Email])
    } catch(err) {
        console.log(err)
    }
}



//Post/Delete

async function Post_Question(FormData) {
    try {
        //get Data about Images
        const QNImages = JSON.parse(FormData.QNImages)
        const ANSImages = JSON.parse(FormData.ANSImages)

        //Save Images
        const QNIMGDIRs = await SaveImages(QNImages, 'QN')
        const ANSIMGDIRs = await SaveImages(ANSImages, 'ANS')
        
        //Save Data in DB

        //Save Data in Questions table and get the new unique QuestionID, and initially question is active
        const result = await pool.query(`
        INSERT INTO Questions(TopicID, PaperID, LevelID, AssessmentID, SchoolID, Email, isActive)
        VALUES($1, $2, $3, $4, $5, $6, TRUE)
        RETURNING QuestionID
        `, [FormData.TopicID, FormData.PaperID, FormData.LevelID, FormData.AssessmentID, FormData.SchoolID, FormData.Email])

        const QuestionID = result.rows[0].questionid

        //Save QNImages in DB
        for (var i=0; i<QNImages.length; i++) {
            const QNImage = QNImages[i]

            await pool.query(`
            INSERT INTO QuestionIMGs(QuestionIMGName, QuestionIMGDIR, QuestionID)
            VALUES($1, $2, $3)
            `, [QNImage.name, QNIMGDIRs[i], QuestionID])
        }

        //Save ANSImages in DB
        for (var i=0; i<ANSImages.length; i++) {
            const ANSImage = ANSImages[i]

            await pool.query(`
            INSERT INTO AnswerIMGs(AnswerIMGName, AnswerIMGDIR, QuestionID)
            VALUES($1, $2, $3)
            `, [ANSImage.name, ANSIMGDIRs[i], QuestionID])
        }

        //Set this Question as a pending payment under the author's name
        await pool.query(`
        INSERT INTO PendingPayments VALUES($1, $2)
        `, [QuestionID, FormData.Email])

    } catch(err) {
        console.log(err)
    }
}

//helper function to save all the images
async function SaveImages(Images, ImageType) {
    var IMGDIRs = []
    for (var i=0; i<Images.length; i++) {
        const filenames = await fs.promises.readdir('./Images/' + ImageType) //read all file names in the QN or ANS Images directory
        const Imageextension = Images[i].name.split('.').slice(-1)[0].toLowerCase() //get the extension in lowercase since when files are saved the extensions become lowercase
        
        //gets an array of all filenames in the folder with the same extension as the uploaded file
        const sameEXTfilenames = filenames.map(filename => {
            const filenamedata = filename.split('.')
            if (Imageextension == filenamedata[1]) {
                return parseInt(filenamedata[0])
            }
        }).filter(filename => filename)

        //get the largest number and adds one to it to get a unique filename
        var NewFilename;
        if (sameEXTfilenames.length == 0) {
            NewFilename = 1
        } else {
            NewFilename = Math.max(...sameEXTfilenames) + 1
        }
        console.log(NewFilename)
        
        //NewFilename + extension is a unique filename

        //save this QNImage file as a unique file in the /Images/QN directory
        const data = Images[i].IMGData.split(',')[1]
        let buffer = Buffer.from(data, 'base64')

        const IMGDIR = './Images/' + ImageType + '/' + NewFilename + '.' + Imageextension
        fs.writeFileSync(IMGDIR, buffer);
        IMGDIRs.push(IMGDIR)
    }

    return IMGDIRs //returns the array of image directories to be saved in the database
}

async function Delete_Question(QuestionID) {
    try {
        //get the directories of the question image files to delete
        const QuestionIMGs = (await pool.query(`
        SELECT QuestionIMGDIR FROM QuestionIMGs WHERE QuestionID=$1
        `, [QuestionID])).rows

        //get the directories of the answer image files to delete
        const AnswerIMGs = (await pool.query(`
        SELECT AnswerIMGDIR FROM AnswerIMGs WHERE QuestionID=$1
        `, [QuestionID])).rows

        console.log(QuestionIMGs, AnswerIMGs)
        for (var i=0; i<QuestionIMGs.length; i++) {
            fs.promises.unlink(QuestionIMGs[i].questionimgdir)
        }

        for (var i=0; i<AnswerIMGs.length; i++) {
            fs.promises.unlink(AnswerIMGs[i].answerimgdir)
        }

        await pool.query(`
        DELETE FROM QuestionIMGs WHERE QuestionID=$1
        `, [QuestionID])
        await pool.query(`
        DELETE FROM AnswerIMGs WHERE QuestionID=$1
        `, [QuestionID])
        await pool.query(`
        DELETE FROM SavedQuestions WHERE QuestionID=$1
        `, [QuestionID])
        await pool.query(`
        DELETE FROM CompletedQuestions WHERE QuestionID=$1
        `, [QuestionID])
        await pool.query(`
        DELETE FROM Upvotes WHERE QuestionID=$1
        `, [QuestionID])
        await pool.query(`
        DELETE FROM PendingPayments WHERE QuestionID=$1
        `, [QuestionID])
        await pool.query(`
        DELETE FROM Questions WHERE QuestionID=$1
        `, [QuestionID])
    } catch(err) {
        console.log(err)
    }
}

async function Edit_Question(QuestionID, FormData) { //First Edit the entry in Questions in the DB with new Editted Data, then Add the new Question and Answer Images as if they were new Questions, then delete the old Question and Answer Images
    try {
        //get Data about Images
        const QNImages = JSON.parse(FormData.QNImages)
        const ANSImages = JSON.parse(FormData.ANSImages)

        //Save Images
        const QNIMGDIRs = await SaveImages(QNImages, 'QN')
        const ANSIMGDIRs = await SaveImages(ANSImages, 'ANS')
        
        //Save Data in DB

        //Update the entry in Questions Table with newly editted Categories
        await pool.query(`
        UPDATE Questions
        SET
            TopicID=$1,
            PaperID=$2,
            LevelID=$3,
            AssessmentID=$4,
            SchoolID=$5

        WHERE QuestionID=$6
        `, [FormData.TopicID, FormData.PaperID, FormData.LevelID, FormData.AssessmentID, FormData.SchoolID, QuestionID])


        //Save the New Images

        //Save QNImages in DB
        for (var i=0; i<QNImages.length; i++) {
            const QNImage = QNImages[i]

            await pool.query(`
            INSERT INTO QuestionIMGs(QuestionIMGName, QuestionIMGDIR, QuestionID)
            VALUES($1, $2, $3)
            `, [QNImage.name, QNIMGDIRs[i], QuestionID])
        }

        //Save ANSImages in DB
        for (var i=0; i<ANSImages.length; i++) {
            const ANSImage = ANSImages[i]

            await pool.query(`
            INSERT INTO AnswerIMGs(AnswerIMGName, AnswerIMGDIR, QuestionID)
            VALUES($1, $2, $3)
            `, [ANSImage.name, ANSIMGDIRs[i], QuestionID])
        }


        //Delete the Old Images

        const temp1 = JSON.parse(FormData.OriginalQNImageIDs).map(QNImage => parseInt(QNImage))
        //Delete QNImages in DB
        const DeletedQNIMGsDIR = (await pool.query(`
        DELETE FROM QuestionIMGs WHERE QuestionIMGID=ANY($1::int[])
        RETURNING QuestionIMGDIR
        `, [JSON.parse(FormData.OriginalQNImageIDs)])).rows

        const temp2 = JSON.parse(FormData.OriginalANSImageIDs).map(ANSImage => parseInt(ANSImage))
        //Delete ANSImages in DB
        const DeletedANSIMGsDIR = (await pool.query(`
        DELETE FROM AnswerIMGs WHERE AnswerIMGID=ANY($1::int[])
        RETURNING AnswerIMGDIR
        `, [JSON.parse(FormData.OriginalANSImageIDs)])).rows

        //Delete QNImages in Images Directory
        for (var i=0; i<DeletedQNIMGsDIR.length; i++) {
            fs.promises.unlink(DeletedQNIMGsDIR[i].questionimgdir)
        }

        //Delete ANSImages in Images Directory
        for (var i=0; i<DeletedANSIMGsDIR.length; i++) {
            fs.promises.unlink(DeletedANSIMGsDIR[i].answerimgdir)
        }
    } catch(err) {
        console.log(err)
    }
}



//Reports

async function Report_Question(QuestionID, Email, ReportText) {
    try {
        await pool.query(`
        INSERT INTO Reports(ReportText, Email, QuestionID)
        VALUES($1, $2, $3)
        `, [ReportText, Email, QuestionID])
    } catch(err) {
        console.log(err)
    }
}

async function Resolve_Report(ReportID) {
    try {
        await pool.query(`
        DELETE FROM Reports WHERE ReportID=$1
        `, [ReportID])
    } catch(err) {
        console.log(err)
    }
}



//Activation

async function Deactivate_Question(QuestionID) {
    try {
        await pool.query(`
        UPDATE Questions
        SET isActive=FALSE
        WHERE QuestionID=$1
        `, [QuestionID])
    } catch(err) {
        console.log(err)
    }
}

async function Activate_Question(QuestionID) {
    try {
        await pool.query(`
        UPDATE Questions
        SET isActive=TRUE
        WHERE QuestionID=$1
        `, [QuestionID])
    } catch(err) {
        console.log(err)
    }
}


//Payments

async function Pay_Creator(Email) {
    try {
        //get the number of pending payments for this creator
        const result = await pool.query(`
        SELECT COUNT(QuestionID) AS PaymentCount FROM PendingPayments WHERE Email=$1
        `, [Email])

        //Remove record of pending payment for this creator
        await pool.query(`
        DELETE FROM PendingPayments WHERE Email=$1
        `, [Email])

        Pay(result.rows[0].paymentcount)
    } catch(err) {
        console.log(err)
    }
}



//Upvotes

async function Unupvote_Question(QuestionID, Email) {
    try {
        await pool.query(`
        DELETE FROM Upvotes
        WHERE QuestionID=$1 AND Email=$2
        `, [QuestionID, Email])
    } catch(err) {
        console.log(err)
    }
}

async function Upvote_Question(QuestionID, Email) {
    try {
        await pool.query(`
        INSERT INTO Upvotes
        VALUES($1, $2)
        `, [QuestionID, Email])
    } catch(err) {
        console.log(err)
    }
}


module.exports = {
    Get_Questions_Filtered,
    Get_QuestionData_fromQuestionID,
    Get_Questions_Saved_All,
    Get_Questions_Saved_Filtered,
    Get_Questions_fromAuthor,
    Get_Questions_Completed_All,
    Get_Questions_Completed_Filtered,
    Get_Reports_All,
    Get_Payments_Pending_All,
    Get_Upvotes_Count_fromQuestionID,
    Get_Author_fromQuestionID,
    Get_QuestionData_toEdit_fromQuestionID,
    Get_Questions_Deactivated_All,
    Get_Questions_Deactivated_Filtered,

    Check_Question_isSaved,
    Check_Question_isCompleted,
    Check_Question_isActive,
    Check_Question_isUpvoted,

    Save_Question,
    unSave_Question,

    Complete_Question,
    Uncomplete_Question,

    Post_Question,
    Delete_Question,
    Edit_Question,

    Report_Question,
    Resolve_Report,

    Deactivate_Question,
    Activate_Question,

    Pay_Creator,

    Unupvote_Question,
    Upvote_Question
};