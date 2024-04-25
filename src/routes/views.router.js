import { Router } from "express";
import ProductManagerDB from '../dao/ProductManagerDB.js';
import messageManagerDB from '../dao/MessageManagerDB.js';
import CartManagerDB from "../dao/CartManagerDB.js";
import productModel from "../dao/models/productModel.js";

const viewsRouter = Router();
const PM = new ProductManagerDB();
const CHM = new messageManagerDB();
const CM = new CartManagerDB();

// Session Index
viewsRouter.get("/", (req, res) => {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        res.redirect("/profile");
    }
});

// Session Login
viewsRouter.get("/login", (req, res) => {
    res.render(
        'login',
        {
            title: 'Session',
            style: 'session.css',
            failLogin: req.session.failLogin ?? false
        }
    )
});

// Session Register
viewsRouter.get("/register", (req, res) => {
    res.render(
        'register',
        {
            title: 'Session',
            style: 'session.css',
            failRegister: req.session.failRegister ?? false
        }
    )
});

// Session Profile
viewsRouter.get("/profile", (req, res) => {
    res.render(
        'profile',
        {
            title: 'Session',
            style: 'session.css',
            user: req.session.user
        }
    )
});

// Show All Products
viewsRouter.get('/allproducts', async (req, res) => {
    let products = await PM.getProducts();
    res.render(
        "home",
        {
            products: products,
            user: req.session.user,
            style: "index.css"
        }
    );
});

// Show All Products with Paginate
viewsRouter.get('/products', async (req, res) => {
    let { page = 1 } = req.query;
    page = parseInt(page);
    const result = await productModel.paginate({}, {page, limit: 5, lean: true});
    const baseURL = "http://localhost:8080/products";
    result.prevLink = result.hasPrevPage ? `${baseURL}?page=${result.prevPage}` : "";
    result.nextLink = result.hasNextPage ? `${baseURL}?page=${result.nextPage}` : "";
    result.title = "Productos";
    result.isValid = !(page <= 0 || page > result.totalPages);
    res.render(
        "products",
        {
            result,
            title: result.title,
            style: "products.css"
        }
    );
});

// Show All Products with Websockets
viewsRouter.get('/realtimeproducts', async (req, res) => {
    let products = await PM.getProducts();
    res.render(
        "realTimeProducts",
        {
            products: products,
            style: "realTimeProducts.css"
        }
    );
});

// Show Single Cart By Cart ID
viewsRouter.get('/carts/:cid', async (req, res) => {
    let cartId = req.params.cid;
    const cart = await CM.getCartById(cartId);
    res.render(
        "cart",
        {
            id: cart._id.toString(),
            products: cart.products,
            style: "cart.css"
        }
    );
});

// Chat App with Websockets
viewsRouter.get('/chat', async (req, res) => {
    let messages = await CHM.getAllMessages();
    res.render(
        "chat",
        {
            messages: messages,
            style: "chat.css"
        }
    );
});

export default viewsRouter;