/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 60d0fe4f5311236168a109ca
 *         username:
 *           type: string
 *           description: Unique username
 *           example: john_doe
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [student, professor, lab_assistant]
 *           description: User role in the system
 *           example: student
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     UserLoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: student1
 *         password:
 *           type: string
 *           format: password
 *           example: "123456"
 *     
 *     UserSignupRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           example: new_user
 *         email:
 *           type: string
 *           format: email
 *           example: newuser@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [student, professor, lab_assistant]
 *           example: student
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/User'
 */

module.exports = {};
