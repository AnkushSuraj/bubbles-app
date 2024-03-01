export const generate_otp = function otp() {
    return Math.floor(100000 + Math.random() * 999999);
}