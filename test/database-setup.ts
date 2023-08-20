import { TestDataSource } from "../ormconfig";

before(async () => {
    await TestDataSource.initialize()
})

after(async () => {
    await TestDataSource.destroy()
});
