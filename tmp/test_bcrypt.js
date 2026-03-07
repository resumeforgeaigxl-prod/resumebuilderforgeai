const bcrypt = require('bcrypt');
async function test() {
    try {
        const hashed = await bcrypt.hash('test', 10);
        console.log('Bcrypt works:', hashed);
        const match = await bcrypt.compare('test', hashed);
        console.log('Match works:', match);
    } catch (err) {
        console.error('Bcrypt error:', err);
    }
}
test();
