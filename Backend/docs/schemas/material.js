/**
 * @swagger
 * components:
 *   schemas:
 *     Material:
 *       type: object
 *       required:
 *         - name
 *         - quantity
 *         - lab
 *         - labId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 60d0fe4f5311236168a109ca
 *         name:
 *           type: string
 *           description: Material name
 *           example: Arduino Uno R3
 *         description:
 *           type: string
 *           description: Material description
 *           example: Microcontroller board based on ATmega328P
 *         category:
 *           type: string
 *           enum: [Equipment, Consumable, Chemical, Tool, Electronic Component, Other]
 *           description: Material category
 *           example: Electronic Component
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Search tags (AI-generated or manual)
 *           example: [arduino, microcontroller, embedded-systems]
 *         quantity:
 *           type: integer
 *           description: Current stock quantity
 *           example: 50
 *         minThreshold:
 *           type: integer
 *           description: Minimum stock alert threshold
 *           example: 10
 *         lab:
 *           type: string
 *           description: Lab ObjectId reference
 *           example: 60d0fe4f5311236168a109ca
 *         labId:
 *           type: string
 *           description: Lab slug identifier
 *           example: electronics-lab
 *         specifications:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Technical specifications
 *           example:
 *             voltage: "5V"
 *             pins: "14 digital, 6 analog"
 *         image:
 *           type: string
 *           description: Material image URL
 *           example: /images/arduino-uno.jpg
 *         lastRestockDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     MaterialCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - quantity
 *         - labId
 *       properties:
 *         name:
 *           type: string
 *           example: Resistor 10K Ohm
 *         description:
 *           type: string
 *           example: Carbon film resistor, 1/4W
 *         quantity:
 *           type: integer
 *           example: 200
 *         labId:
 *           type: string
 *           example: electronics-lab
 *         category:
 *           type: string
 *           example: Electronic Component
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: [resistor, passive-component]
 *         image:
 *           type: string
 *           example: /images/resistor.jpg
 *     
 *     MaterialUpdateRequest:
 *       type: object
 *       properties:
 *         quantity:
 *           type: integer
 *           example: 150
 *         minThreshold:
 *           type: integer
 *           example: 20
 *         description:
 *           type: string
 *           example: Updated description
 *     
 *     AICategorizeRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Arduino Uno
 *         description:
 *           type: string
 *           example: Microcontroller board for embedded projects
 *     
 *     AICategorizeResponse:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *           example: Electronic Component
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: [arduino, microcontroller, embedded-systems]
 *     
 *     AISearchRequest:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *           example: Show me all Arduino compatible components
 *         labId:
 *           type: string
 *           example: electronics-lab
 *     
 *     AISearchResponse:
 *       type: object
 *       properties:
 *         materials:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Material'
 *         totalResults:
 *           type: integer
 *           example: 5
 *         aiPowered:
 *           type: boolean
 *           example: true
 *         intent:
 *           type: string
 *           example: search for arduino compatible components
 */

module.exports = {};
