/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       required:
 *         - lab
 *         - professor
 *         - date
 *         - startTime
 *         - endTime
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 60d0fe4f5311236168a109ca
 *         lab:
 *           type: string
 *           description: Lab ObjectId reference
 *           example: 60d0fe4f5311236168a109ca
 *         professor:
 *           type: string
 *           description: Professor user ID reference
 *           example: 60d0fe4f5311236168a109ca
 *         date:
 *           type: string
 *           format: date
 *           description: Schedule date
 *           example: "2026-02-15"
 *         startTime:
 *           type: string
 *           description: Start time (24-hour format)
 *           example: "14:00"
 *         endTime:
 *           type: string
 *           description: End time (24-hour format)
 *           example: "16:00"
 *         timeSlot:
 *           type: string
 *           description: Combined time slot
 *           example: "14:00-16:00"
 *         courseName:
 *           type: string
 *           description: Course name
 *           example: Physics 101
 *         className:
 *           type: string
 *           description: Class section
 *           example: Section A
 *         expectedStudents:
 *           type: integer
 *           description: Expected number of students
 *           example: 30
 *         purpose:
 *           type: string
 *           description: Purpose of lab session
 *           example: Optics experiment
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *           description: Schedule status
 *           example: scheduled
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     ScheduleCreateRequest:
 *       type: object
 *       required:
 *         - labId
 *         - date
 *         - startTime
 *         - endTime
 *         - courseName
 *       properties:
 *         labId:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         date:
 *           type: string
 *           format: date
 *           example: "2026-02-15"
 *         startTime:
 *           type: string
 *           example: "14:00"
 *         endTime:
 *           type: string
 *           example: "16:00"
 *         courseName:
 *           type: string
 *           example: Physics 101
 *         className:
 *           type: string
 *           example: Section A
 *         expectedStudents:
 *           type: integer
 *           example: 30
 *         purpose:
 *           type: string
 *           example: Laboratory practical session
 *     
 *     AvailabilityCheckResponse:
 *       type: object
 *       properties:
 *         available:
 *           type: boolean
 *           example: true
 *         conflicts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Schedule'
 */

module.exports = {};
