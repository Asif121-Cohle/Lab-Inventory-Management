/**
 * @swagger
 * /materials:
 *   get:
 *     summary: Get all materials
 *     tags: [Materials]
 *     responses:
 *       200:
 *         description: List of all materials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 materials:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Material'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   
 *   post:
 *     summary: Add new material with AI categorization (Lab Assistant only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaterialCreateRequest'
 *     responses:
 *       201:
 *         description: Material created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Material added successfully
 *                 material:
 *                   $ref: '#/components/schemas/Material'
 *                 aiGenerated:
 *                   type: boolean
 *                   description: Whether category/tags were AI-generated
 *                   example: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /materials/{id}:
 *   get:
 *     summary: Get material by ID
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material MongoDB ObjectId
 *         example: 60d0fe4f5311236168a109ca
 *     responses:
 *       200:
 *         description: Material details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 material:
 *                   $ref: '#/components/schemas/Material'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   
 *   put:
 *     summary: Update material (Lab Assistant only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material MongoDB ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaterialUpdateRequest'
 *     responses:
 *       200:
 *         description: Material updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Material updated successfully
 *                 material:
 *                   $ref: '#/components/schemas/Material'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   
 *   delete:
 *     summary: Delete material (Lab Assistant only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Material deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Material deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /materials/categorize:
 *   post:
 *     summary: Categorize material using AI (Lab Assistant only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AICategorizeRequest'
 *     responses:
 *       200:
 *         description: AI categorization result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AICategorizeResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /materials/search:
 *   post:
 *     summary: AI-powered natural language material search
 *     tags: [Materials]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AISearchRequest'
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AISearchResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = {};
