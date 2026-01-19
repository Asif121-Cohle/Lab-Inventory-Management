/**
 * @swagger
 * /labs:
 *   get:
 *     summary: Get all labs
 *     tags: [Labs]
 *     responses:
 *       200:
 *         description: List of all labs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lab'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   
 *   post:
 *     summary: Create a new lab (Lab Assistant only)
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabCreateRequest'
 *     responses:
 *       201:
 *         description: Lab created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lab created successfully
 *                 lab:
 *                   $ref: '#/components/schemas/Lab'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /labs/{id}:
 *   get:
 *     summary: Get lab by ID
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab ID (MongoDB ObjectId or slug)
 *         example: computer-lab
 *     responses:
 *       200:
 *         description: Lab details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lab:
 *                   $ref: '#/components/schemas/Lab'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /labs/{id}/materials:
 *   get:
 *     summary: Get all materials in a specific lab
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab ID (slug)
 *         example: computer-lab
 *     responses:
 *       200:
 *         description: List of materials in the lab
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 materials:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Material'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = {};
