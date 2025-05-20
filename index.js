const { connectDB, closeDB } = require("./utils/db");

async function main() {
  try {
    const db = await connectDB();

    // Ví dụ lấy danh sách collection
    const collections = await db.collections();
    console.log("Collections:", collections.map(c => c.collectionName));

    // Xử lý logic khác...

  } catch (error) {
    console.error(error);
  } finally {
    await closeDB();
  }
}

main();
