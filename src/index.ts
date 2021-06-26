import {createConnection} from 'typeorm';
import {Post} from './entity/Post';
import {Category} from './entity/Category';

// connection settings are in the "ormconfig.json" file
createConnection()
    .then(async (connection) => {
        let posts = await Post.createQueryBuilder().limit(1).orderBy('random()').getMany();
        await posts.loadRelation('categories');


        setTimeout(() => {
        }, 2000000);
    })
    .catch((error) => console.log('Error: ', error));
