/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create material request (Student only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestCreateRequest'
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request created successfully
 *                 request:
 *                   $ref: '#/components/schemas/Request'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /requests/my-requests:
 *   get:
 *     summary: Get my requests (Student only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Request'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /requests/pending:
 *   get:
 *     summary: Get pending requests (Lab Assistant only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Request'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /requests/{id}/approve:
 *   put:
 *     summary: Approve material request (Lab Assistant only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request MongoDB ObjectId
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               responseNote:
 *                 type: string
 *                 example: Approved for project use
 *     responses:
 *       200:
 *         description: Request approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request approved
 *                 request:
 *                   $ref: '#/components/schemas/Request'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /requests/{id}/reject:
 *   put:
 *     summary: Reject material request (Lab Assistant only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request MongoDB ObjectId
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               responseNote:
 *                 type: string
 *                 example: Insufficient stock
 *     responses:
 *       200:
 *         description: Request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request rejected
 *                 request:
 *                   $ref: '#/components/schemas/Request'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /requests/ai-suggest:
 *   post:
 *     summary: Get AI-powered material suggestions for project (Student only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIRequestSuggestionRequest'
 *     responses:
 *       200:
 *         description: AI material suggestions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIRequestSuggestionResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = {};
