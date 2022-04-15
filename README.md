# TYPEORM HELPER

Provide functions for relational handling in Typeorm.

## How to use?

Extend BaseEntity from typeorm-helper

```typescript
export class Post extends BaseEntity {
}
```

Extend BaseRepository from typeorm-helper

```typescript
@EntityRepository(Post)
export class PostRepository extends BaseRepository<Post> {
}
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
await users.loadRelation({
    'posts': (query) => {
        query.where(' orginationId != :orginationId ', { orginationId: 1 })
    }
});
```

##### Pagination

```typescript
let userRepo = getConnection().getCustomRepository(UserRepository);
let userPagination = await userRepo.pagination({}, { page: 1, perPage: 10 });
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

## WHERE EXPRESSION
>For queries that are complex, need to be reused, or contain a lot of logic. We should use a class to store it.
```typescript
export class BelongToUserWhereExpression extends BaseWhereExpression {
    constructor(private userId: number) {
        super();
    }

    where(query: WhereExpression) {
        query.where({ userId: this.userId });
    }
}
```

Use:
```typescript
this.postRepo.find({
    where: new BelongToUserWhereExpression(1)
})
```

## Query Builder
>For queries that are complex, need to be reused, or contain a lot of logic. We should use a class to store it.
```typescript
export class PostOfUserQuery extends BaseQuery<Post> {
    constructor(private userId: number) {
        super();
    }

    query(query: SelectQueryBuilder<Post>) {
        query.where({ userId: this.userId })
            .limit(10);
    }

    order(query: SelectQueryBuilder<Post>) {
        query.orderBy('id', 'DESC');
    }
}
```

```typescript
this.postRepo.find(new PostOfUserQuery(1));
```

## MIGRATIONS
> We create a class, which wraps the migration of typeorm, allowing for simpler and more readable. For the update command, let's use pure queries for the time being.

- Example:
```typescript
export class CreateUserTable1626749239046 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('User', (table) => {
            table.primaryUuid('id');
            table.string('email').index();
            table.string('firstName').nullable();
            table.string('lastName').nullable();
            table.string('password').nullable();
            table.integer('role');
            table.string('language').length(10).default("'en'");
            table.timestamp('lastLoginAt').nullable();
            table.uuid('enterpriseId').nullable().index().foreign('Enterprise');
            table.createdAt().index();
            table.updatedAt();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Fuel');
    }
}
```

### Table method
```typescript
    string(name: string, length?: number, options?: Partial<TableColumnOptions>): BaseColumn;
    strings(name: string, options?: Partial<TableColumnOptions>): BaseColumn;
    uuid(name?: string, options?: Partial<TableColumnOptions>): BaseColumn;
    uuids(name: string, options?: Partial<TableColumnOptions>): BaseColumn;
    primaryUuid(name?: string, options?: Partial<TableColumnOptions>): BaseColumn;
    integer(name: string, options?: Partial<TableColumnOptions>): BaseColumn;
    integers(name: string, options?: Partial<TableColumnOptions>): BaseColumn;
    timestamp(name: string, options?: Partial<TableColumnOptions>): BaseColumn;
    boolean(name: string, options?: Partial<TableColumnOptions>): BaseColumn;
    jsonb(name: string, options?: Partial<TableColumnOptions>): BaseColumn;
    json(name: string, options?: Partial<TableColumnOptions>): BaseColumn;
    decimal(name: string,precision: number = 10,scale: number = 2,options?: Partial<TableColumnOptions>): BaseColumn;
    baseTime(): void;
    createdAt(): BaseColumn;
    updatedAt(): BaseColumn;
    deletedAt(): BaseColumn;
```

### Column method
```typescript
    length(length: number): this;
    nullable(): this;
    unique(): this;
    index(): this;
    default(value: any): this;
    foreign(table: string, column?: string, onDelete?: string, onUpdate?: string): void;
```
