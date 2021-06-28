# TYPEORM HELPER
This library provider some function for typeorm
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
