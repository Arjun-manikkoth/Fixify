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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserRepository_1 = __importDefault(require("../Repositories/UserRepository"));
const ProviderRepository_1 = __importDefault(require("../Repositories/ProviderRepository"));
//create a user repository instance
const userRepository = new UserRepository_1.default();
//create a provider repository instance
const providerRepository = new ProviderRepository_1.default();
//middleware to check the block status of user and provider
const checkBlockedStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = (_a = req.data) === null || _a === void 0 ? void 0 : _a.id;
        const role = (_b = req.data) === null || _b === void 0 ? void 0 : _b.role;
        if (role === "user") {
            const userData = yield userRepository.getUserDataWithId(id);
            if (userData === null || userData === void 0 ? void 0 : userData.is_blocked) {
                res.status(401).json({ message: "Blocked by admin", status: false });
            }
            else {
                next();
            }
        }
        else if (role === "provider") {
            const providerData = yield providerRepository.getProviderDataWithId(id);
            if (providerData === null || providerData === void 0 ? void 0 : providerData.is_blocked) {
                res.status(401).json({ message: "Blocked by admin", status: false });
            }
            else {
                next();
            }
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", status: false });
    }
});
exports.default = checkBlockedStatus;
