"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_INFO = exports.authDemo = void 0;
// Demo authentication configuration with relaxed requirements
var better_auth_1 = require("better-auth");
var drizzle_1 = require("better-auth/adapters/drizzle");
var db_1 = require("./db");
var schema = require("./db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var bcryptjs_1 = require("bcryptjs");
// Demo credentials
var DEMO_CREDENTIALS = {
    email: "demo@csi.mil",
    password: "DemoPass123!"
};
exports.authDemo = (0, better_auth_1.betterAuth)({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
    database: (0, drizzle_1.drizzleAdapter)(db_1.db, {
        provider: "sqlite",
        schema: schema,
        usePlural: true,
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    user: {
        additionalFields: {
            roleId: { type: "number" },
        },
    },
    hooks: {
        before: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var email, _a, email, password, users, hashedPassword, adminRole, newRole;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // In demo mode, allow any .mil email or the demo email
                        if (ctx.path === "/sign-up/email") {
                            email = ctx.body.email;
                            // Allow demo email or any .mil email
                            if (email !== DEMO_CREDENTIALS.email && !email.endsWith(".mil")) {
                                return [2 /*return*/, ctx.json({
                                        message: "Demo mode: Use demo@csi.mil or any .mil email"
                                    }, { status: 400 })];
                            }
                        }
                        if (!(ctx.path === "/sign-in/email" && process.env.DEMO_MODE === "true")) return [3 /*break*/, 7];
                        _a = ctx.body, email = _a.email, password = _a.password;
                        if (!(email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password)) return [3 /*break*/, 7];
                        return [4 /*yield*/, db_1.db.select().from(schema.users)
                                .where((0, drizzle_orm_1.eq)(schema.users.email, DEMO_CREDENTIALS.email))
                                .limit(1)];
                    case 1:
                        users = _b.sent();
                        if (!(users.length === 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, bcryptjs_1.default.hash(DEMO_CREDENTIALS.password, 10)];
                    case 2:
                        hashedPassword = _b.sent();
                        return [4 /*yield*/, db_1.db.select().from(schema.roles)
                                .where((0, drizzle_orm_1.eq)(schema.roles.name, "Admin"))
                                .limit(1)];
                    case 3:
                        adminRole = _b.sent();
                        if (!(adminRole.length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, db_1.db.insert(schema.roles).values({
                                name: "Admin",
                                permissions: JSON.stringify(["all"])
                            }).returning()];
                    case 4:
                        newRole = (_b.sent())[0];
                        adminRole = [newRole];
                        _b.label = 5;
                    case 5: return [4 /*yield*/, db_1.db.insert(schema.users).values({
                            name: "Demo User",
                            email: DEMO_CREDENTIALS.email,
                            passwordHash: hashedPassword,
                            roleId: adminRole[0].id
                        })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        }); },
        after: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var defaultRole, newRole;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(ctx.path === "/sign-up/email" && ((_a = ctx.returned) === null || _a === void 0 ? void 0 : _a.user))) return [3 /*break*/, 5];
                        return [4 /*yield*/, db_1.db.select().from(schema.roles)
                                .where((0, drizzle_orm_1.eq)(schema.roles.name, "Viewer"))
                                .limit(1)];
                    case 1:
                        defaultRole = _b.sent();
                        if (!(defaultRole.length === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, db_1.db.insert(schema.roles).values({
                                name: "Viewer",
                                permissions: JSON.stringify(["read"])
                            }).returning()];
                    case 2:
                        newRole = (_b.sent())[0];
                        defaultRole = [newRole];
                        _b.label = 3;
                    case 3: return [4 /*yield*/, db_1.db
                            .update(schema.users)
                            .set({ roleId: defaultRole[0].id })
                            .where((0, drizzle_orm_1.eq)(schema.users.id, ctx.returned.user.id))];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        }); },
    },
});
// Export demo credentials for reference
exports.DEMO_INFO = {
    credentials: DEMO_CREDENTIALS,
    message: "Use demo@csi.mil / DemoPass123! to login",
    note: "This is a demo instance with sample data"
};
