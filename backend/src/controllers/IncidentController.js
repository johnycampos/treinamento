const connection = require('../database/connection');

module.exports = {

    async index(request, response){
//**esquema de paginação com 5 itens por pagina */
        const {page = 1} = request.query;

        //**retornar a quantidade de itens do banco com o count */

        const count = await connection('incidents')
        .count();

        const incidents = await connection('incidents')
        //**relacionar dados de duas tabelas usa o join*/
        .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
        .limit(5)

        //**retornar somente 5 paginas com o offset((page)) */
        .offset((page - 1)* 5)

        //**separar os dados que quer da tabela ongs */
        .select(['incidents.*', 
        'ongs.name', 
        'ongs.email',
        'ongs.whatsapp',
        'ongs.city',
        'ongs.uf'
        
        ]);

        response.header('X-Total-Count', count['count(*)']);

        return response.json(incidents);
    },

    async create(request, response){
        const { tittle, description, value } = request.body;
        const ong_id = request.headers.authorization;

        const [id] = await connection('incidents').insert({
            tittle,
            description,
            value,
            ong_id,
        });

        return response.json({ id });

    },

    
    async delete(request, response){
        const { id } = request.params;
        const ong_id = request.headers.authorization;

        const incident = await connection('incidents')
        .where('id',id)
        .select('ong_id')
        .first();
/**operador de logia
 * == igualdade
 * != diferença
 */
        if (incident.ong_id  != ong_id) {
            return response.status(401).json({error: 'Operation not Permitted'});

        }

await connection('incidents').where('id', id).delete();

/**204 quando vai retornar uma resposta pro front end sem conteudo 
 * send pra enviar a resposta sem corpo nenhum
 */
return response.status(204).send();   
        

    }

};