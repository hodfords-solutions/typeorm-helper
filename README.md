# TYPEORM HELPER
Provide functions for relational handling in Typeorm.
## How to use?
Extend BaseEntity from typeorm-helper
```typescript
export class Post extends BaseEntity {}
```

Extend BaseRepository from typeorm-helper
```typescript
@EntityRepository(Post)
export class PostRepository extends BaseRepository<Post> {}
```

## RELATION LOADER

##### Single
```typescript
let user = await User.createQueryBuilder().getOne();
await user.loadRelation(['posts', 'roles']);
```
##### Multiple
```typescript
let users = await User.createQueryBuilder().find();
await users.loadRelation({ 'posts': (query) => {
    query.where(' orginationId != :orginationId ', { orginationId: 1 })
} });
```
##### Pagination
```typescript
let userRepo = getConnection().getCustomRepository(UserRepository);
let userPagination = await userRepo.pagination( {}, { page: 1, perPage: 10 } );
await userPagination.loadRelation('posts');
```
## Repository

```typescript
@EntityRepository(Category)
export class CategoryRepository extends BaseRepository<Category> {
}
```

## Entity
```typescript
@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Post, (post) => post.categories)
    posts: Post[];

    @OneToMany(() => PostCategory, postToCategory => postToCategory.category)
    public postCategories!: PostCategory[];
}
```
## Relation condition
##### Simple
```typescript
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @RelationCondition(
        (query: SelectQueryBuilder<any>) => {
            query.where(' posts.id = :postId', { postId: 1 });
        }
    )
    @OneToMany(() => Post, (post) => post.user, { cascade: true })
    posts: Post[];

    @RelationCondition(
        (query: SelectQueryBuilder<any>, entities) => {
            query.orderBy('id', 'DESC');
            if (entities.length === 1) {
                query.limit(1);
            } else {
                query.andWhere(' "latestPost".id in (select max(id) from "post" "maxPost" where "maxPost"."userId" = "latestPost"."userId")');
            }
        }
    )
    @OneToOne(() => Post, (post) => post.user, { cascade: true })
    latestPost: Post;
}
```

### Map data
```typescript
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @RelationCondition(
        (query: SelectQueryBuilder<any>) => {
            query.where(' posts.id = :postId', { postId: 1 });
        },
        (entity, result, column) => {
            if (entity.id === 2) {
                return false;
            }
            return true;
        }
    )
    @OneToMany(() => Post, (post) => post.user, { cascade: true })
    posts: Post[];
}
```
