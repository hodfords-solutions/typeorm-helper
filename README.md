<p align="center">
  <a href="http://opensource.hodfords.uk" target="blank"><img src="https://opensource.hodfords.uk/img/logo.svg" width="320" alt="Hodfords Logo" /></a>
</p>

<p align="center"> <b>nestjs-validation</b> enhances validation in your NestJS projects by providing a customized `ValidationPipe` that returns custom error messages. This library simplifies error handling by offering localized and user-friendly responses</p>

## Installation 🤖

Install the `typeorm-helper` package with:

```bash
npm install @hodfords/typeorm-helper --save
```

## Usage 🚀

### Defining custom repositories and entities

When managing different entities, you can define custom repositories and entities. Below is an example for the Category entity and its corresponding repository.

#### Entity

The `Category` table in the database is modeled by the `CategoryEntity`, `typeorm` decorators should be used to define this entity.

```typescript
import { BaseEntity } from '@hodfords/typeorm-helper';
import { Column, Entity, ManyToMany, JoinTable, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Category')
export class CategoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => PostEntity, (post) => post.categories)
    @JoinTable({ name: 'PostCategory' })
    posts: PostEntity[];
}
```

#### Repository

The `CategoryRepository` is a custom repository that handles all database operations related to the `CategoryEntity`. By using the `@CustomRepository` decorator and extending `BaseRepository`, you ensure that your repository has both common CRUD functionality and can be easily customized with entity-specific methods.

```typescript
import { CustomRepository, BaseRepository } from '@hodfords/typeorm-helper';

@CustomRepository(CategoryEntity)
export class CategoryRepository extends BaseRepository<CategoryEntity> {}
```

### Lazy Relations

Lazy relations allow you to load related entities only when they are needed. This can significantly improve performance by preventing the fetching of unnecessary data upfront.

This functionality supports handling single entity, collection of entities, and paginated collection. Below is an example of how to load a list of posts associated with a specific category.

##### Single entity

```typescript
const categoryRepo = getDataSource().getCustomRepository(CategoryRepository);
const category = await categoryRepo.findOne({});
await category.loadRelation(['posts']);
```

##### Collection of entities

```typescript
const categoryRepo = getDataSource().getCustomRepository(CategoryRepository);
const categories = await categoryRepo.findOne({ name: ILIKE('%football' });
await this.categories.loadRelations(['posts']);
```

##### Paginate collection

```typescript
const categoryRepo = getDataSource().getCustomRepository(CategoryRepository);
const pagedCategories = await categoryRepo.pagination({}, { page: 1, perPage: 10 });
await pagedCategories.loadRelation('posts');
```

You can also make use of the loadRelations function to efficiently load and retrieve related data

```typescript
await loadRelations(categories, ['posts']);
```

### Relation Condition

Sometimes, you need to add custom conditions when loading related entities. `typeorm-helper` provides the
`@RelationCondition` decorator for this purpose.

##### Simple condition

This ensures that the posts relation is only loaded when the condition `posts.id = :postId` is satisfied.

```typescript
@Entity('User')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @RelationCondition((query: SelectQueryBuilder<any>) => {
        query.where(' posts.id = :postId', { postId: 1 });
    })
    @OneToMany(() => PostEntity, (post) => post.user, { cascade: true })
    posts: PostEntity[];

    @RelationCondition((query: SelectQueryBuilder<any>, entities) => {
        query.orderBy('id', 'DESC');
        if (entities.length === 1) {
            query.limit(1);
        } else {
            query.andWhere(
                ' "latestPost".id in (select max(id) from "post" "maxPost" where "maxPost"."userId" = "latestPost"."userId")'
            );
        }
    })
    @OneToOne(() => PostEntity, (post) => post.user, { cascade: true })
    latestPost: PostEntity;
}
```

#### Complex condition

Here, the condition applies a limit if only one entity is found, and fetches the latest post for each user if there are multiple entities.

```typescript
@Entity('User')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @RelationCondition(
        (query: SelectQueryBuilder<any>) => {
            query.where(' posts.id = :postId', { postId: 1 });
        },
        (entity, result, column) => {
            return entity.id !== 2;
        }
    )
    @OneToMany(() => PostEntity, (post) => post.user, { cascade: true })
    posts: PostEntity[];
}
```

### Where Expression

For complex queries that need to be reused or involve a lot of logic, it's best to put them in a class

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

```typescript
const posts = await this.postRepo.find({ where: new BelongToUserWhereExpression(1) });
```

### Query Builder

For complex and reusable queries, it's helpful to put the logic inside a class. This makes it easier to manage and reuse the query, resulting in cleaner and more maintainable code.

```typescript
export class PostOfUserQuery extends BaseQuery<PostEntity> {
    constructor(private userId: number) {
        super();
    }

    query(query: SelectQueryBuilder<PostEntity>) {
        query.where({ userId: this.userId }).limit(10);
    }

    order(query: SelectQueryBuilder<PostEntity>) {
        query.orderBy('id', 'DESC');
    }
}
```

```typescript
const posts = await this.postRepo.find(new PostOfUserQuery(1));
```

### Migrations

We develop a class that abstracts the typeorm migration, making it easier to understand. For the update command, let's use pure queries for the time being.

### Example

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
        await this.drop('User');
    }
}
```

### Table methods

The Table class provides various methods for defining columns in a database schema

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

The BaseColumn class provides methods that define and configure properties for a database column, including length, nullability, uniqueness, indexing, default values, and foreign key relationships.

```typescript
    length(length: number): this;
    nullable(): this;
    unique(): this;
    index(): this;
    default(value: any): this;
    foreign(table: string, column?: string, onDelete?: string, onUpdate?: string): void;
```

## License 📝

This project is licensed under the MIT License
