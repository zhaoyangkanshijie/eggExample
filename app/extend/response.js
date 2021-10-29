module.exports = {
    set foo(value) {
        this.set('x-response-foo', value);
    },
    get isSuccess() {
        return this.status === 200;
    },
};