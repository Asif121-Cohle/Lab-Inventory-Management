/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Send message to AI chat assistant
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /chat/suggestions:
 *   get:
 *     summary: Get chat suggestion prompts
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of suggested questions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatSuggestion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /analytics/data:
 *   get:
 *     summary: Get analytics data (all materials, labs, requests)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complete analytics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsData'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /analytics/generate-summary:
 *   post:
 *     summary: Generate AI-powered analytics summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI-generated analytics summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsSummaryResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = {};
