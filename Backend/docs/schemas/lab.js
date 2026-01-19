/**
 * @swagger
 * components:
 *   schemas:
 *     Lab:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 60d0fe4f5311236168a109ca
 *         id:
 *           type: string
 *           description: Unique lab identifier (slug)
 *           example: computer-lab
 *         name:
 *           type: string
 *           description: Lab name
 *           example: Computer Lab
 *         description:
 *           type: string
 *           description: Lab description
 *           example: State-of-the-art computer laboratory
 *         location:
 *           type: string
 *           description: Physical location
 *           example: Building A, Floor 2
 *         capacity:
 *           type: integer
 *           description: Maximum student capacity
 *           example: 30
 *         image:
 *           type: string
 *           description: Lab image URL
 *           example: /images/computer-lab.jpg
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 60d0fe4f5311236168a109ca
 *         id: computer-lab
 *         name: Computer Lab
 *         description: Modern computing facility
 *         location: Building A, Floor 2
 *         capacity: 30
 *         image: /images/computer-lab.jpg
 *     
 *     LabCreateRequest:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           example: robotics-lab
 *         name:
 *           type: string
 *           example: Robotics Lab
 *         description:
 *           type: string
 *           example: Advanced robotics research facility
 *         location:
 *           type: string
 *           example: Building B, Floor 3
 *         capacity:
 *           type: integer
 *           example: 25
 *         image:
 *           type: string
 *           example: /images/robotics-lab.jpg
 */

module.exports = {};
