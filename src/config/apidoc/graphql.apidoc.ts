/**
 * @api {post} /graphql GraphQL Endpoint
 * @apiDescription Endpoint for the graphlql server
 * <br/>
 * <a href="../v1/graphql/"> GraphQL playground and schema docs</a>
 * <br/>
 * <a href="../Insomnia_2022-03-30.json"> Insomnia Export</a>
 *
 * @apiVersion 1.0.0
 * @apiName GraphQL
 * @apiGroup GraphQL
 * @apiPermission public
 *
 * @apiHeader {string} Content-Type
 * @apiHeader {string} Authorization
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Content-Type": "application/json"
 *       "Authorization": "Bearer <token>"
 *     }
 *
 *
 * @apiSuccess (200) {json}  errors    GraphQL Errors
 * @apiSuccess (200) {json}  data      GraphQL Data
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200
 *     {
 *          "errors": {},
 *          "data": {},
 *      }
 */
