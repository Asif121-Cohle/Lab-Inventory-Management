/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: User's chat message/query
 *           example: What materials are available in the electronics lab?
 *         conversationHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, assistant]
 *               content:
 *                 type: string
 *           description: Previous conversation context
 *           example:
 *             - role: user
 *               content: Hello
 *             - role: assistant
 *               content: Hi! How can I help you?
 *     
 *     ChatResponse:
 *       type: object
 *       properties:
 *         response:
 *           type: string
 *           description: AI assistant's response
 *           example: The Electronics Lab has Arduino boards, resistors, LEDs, and more.
 *         timestamp:
 *           type: string
 *           format: date-time
 *     
 *     ChatSuggestion:
 *       type: object
 *       properties:
 *         suggestions:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - What materials are in the computer lab?
 *             - Show me low stock items
 *             - How do I request materials?
 *     
 *     AnalyticsData:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             materials:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 *             labs:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lab'
 *             requests:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 *     
 *     AnalyticsSummaryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         summary:
 *           type: string
 *           description: AI-generated markdown summary
 *           example: "## Inventory Analytics Summary\n\n### Key Findings\n- Total materials: 150\n- Low stock items: 12"
 *         generatedAt:
 *           type: string
 *           format: date-time
 *         dataSnapshot:
 *           type: object
 *           properties:
 *             totalMaterials:
 *               type: integer
 *               example: 150
 *             totalQuantity:
 *               type: integer
 *               example: 5420
 *             stockStatus:
 *               type: object
 *               properties:
 *                 inStock:
 *                   type: integer
 *                   example: 120
 *                 lowStock:
 *                   type: integer
 *                   example: 25
 *                 outOfStock:
 *                   type: integer
 *                   example: 5
 */

module.exports = {};
