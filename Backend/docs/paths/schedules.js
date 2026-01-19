/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Get all schedules (Professor/Lab Assistant only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   
 *   post:
 *     summary: Create lab schedule (Professor only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleCreateRequest'
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Schedule created successfully
 *                 schedule:
 *                   $ref: '#/components/schemas/Schedule'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: Time slot already booked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lab is already booked for this time slot
 *                 conflicts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /schedules/check-availability:
 *   get:
 *     summary: Check lab availability for specific time slot
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: labId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab MongoDB ObjectId
 *         example: 60d0fe4f5311236168a109ca
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check
 *         example: "2026-02-15"
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *         description: Time slot (format "HH:MM-HH:MM")
 *         example: "14:00-16:00"
 *     responses:
 *       200:
 *         description: Availability check result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvailabilityCheckResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /schedules/my-schedules:
 *   get:
 *     summary: Get my schedules (Professor only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of professor's schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /schedules/{id}:
 *   put:
 *     summary: Update schedule (Professor only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule MongoDB ObjectId
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 example: "15:00"
 *               endTime:
 *                 type: string
 *                 example: "17:00"
 *               purpose:
 *                 type: string
 *                 example: Updated purpose
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Schedule updated successfully
 *                 schedule:
 *                   $ref: '#/components/schemas/Schedule'
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
 *     summary: Cancel schedule (Professor only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Schedule cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Schedule cancelled successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = {};
