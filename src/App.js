import React, { Component } from 'react';
import './App.scss';

class SizeButton extends Component {
  render() {
    return (
      <button className="filters-available-size">{this.props.size}</button>
    );
  }
}

class Sidebar extends Component {
  render() {
    return (
      <div className="filters">
        <h4 className="title">Sizes:</h4>
        <SizeButton size="XS" />
        <SizeButton size="S" />
        <SizeButton size="M" />
        <SizeButton size="X" />
        <SizeButton size="ML" />
        <SizeButton size="L" />
        <SizeButton size="XL" />
        <SizeButton size="XXL" />
      </div>
    );
  }
}

class ProductSizeButton extends Component {
  render() {
    const size = this.props.size;
    return (
      <div
        className="shelf-item__buy-btn"
        onClick={() => this.props.handleButtonClick()}
      >
        {size}
      </div>
    );
  }
}

class Product extends Component {
  render() {
    const product = this.props.product;

    const buyButtons = Object.keys(product.availableSizes).map((size, qty) => {
      return (
        <ProductSizeButton
          size={size}
          handleButtonClick={() => this.props.handleButtonClick(size)}
        />
      );
    })

    return (
      <div className="shelf-item">
        <div className="shelf-item__thumb">
          <img src={require(`./static/data/products/${product.sku}_1.jpg`)}
           alt={product.title} />
        </div>
        <p className="shelf-item__title">{product.title}</p>
        <p className="shelf-item__price">${product.price.toFixed(2)}</p>
        {buyButtons}
      </div>
    );
  }
}

class Canvas extends Component {

  render() {
    const products = this.props.inventory;
    const productListing = products.map((key, val) => {
      let p = products[val];
      return (
        <Product
          key={p.sku}
          product={p}
          handleButtonClick={(sz) => this.props.handleAddToCartButton(p, sz)}
        />
      );
    });

    return (
      <div className="shelf-container">
        <div className="shelf-container-header">Number of products: {products.length}</div>
        {productListing}
      </div>
    );
  }
}

class CartProduct extends Component {
  state = {
    isMouseOver: false
  };

  handleMouseOver = () => {
    this.setState({ isMouseOver: true });
  };

  handleMouseOut = () => {
    this.setState({ isMouseOver: false });
  };

  render() {
    const { product, removeProduct } = this.props;
    const classes = ['shelf-item'];

    if (!!this.state.isMouseOver) {
      classes.push('shelf-item--mouseover');
    }

    return (
      <div className={classes.join(' ')}>
        <div
          className="shelf-item__del"
          onMouseOver={() => this.handleMouseOver()}
          onMouseOut={() => this.handleMouseOut()}
          onClick={() => removeProduct(product)}
        />
        <img
          className="shelf-item__thumb"
          src={require(`./static/data/products/${product.sku}_2.jpg`)}
          alt={product.title}
        />
        <div className="shelf-item__details">
          <p className="title">{product.title}</p>
          <p className="desc">
            {`availableSizes | ${product.style}`} <br />
            Quantity: {product.quantity}
          </p>
        </div>
        <div className="shelf-item__price">
          <p>${product.price.toFixed(2)}</p>
        </div>

        <div className="clearfix" />
      </div>
    );
  }
}

class FloatCart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.productToAdd !== this.props.productToAdd) {
      this.addProduct(nextProps.productToAdd);
    }

    if (nextProps.productToRemove !== this.props.productToRemove) {
      this.removeProduct(nextProps.productToRemove);
    }
  }

  openFloatCart = () => {
    this.setState({ isOpen: true });
  };

  closeFloatCart = () => {
    this.setState({ isOpen: false });
  };

  addProduct = product => {
    const cartProducts = this.props.cartProducts;
    const updateCart = this.props.updateCart;
    let productAlreadyInCart = false;

    cartProducts.forEach(cp => {
      if (cp.id === product.id && cp.size == product.size) {
        cp.quantity += product.quantity;
        productAlreadyInCart = true;
      }
    });

    if (!productAlreadyInCart) {
      cartProducts.push(product);
    }

    updateCart(cartProducts);
    this.openFloatCart();
  };

  removeProduct = product => {
    const cartProducts = this.props.cartProducts;
    const updateCart = this.props.updateCart;

    const index = cartProducts.findIndex(p => p.id === product.id);
    if (index >= 0) {
      cartProducts.splice(index, 1);
      updateCart(cartProducts);
    }
  };

  render() {
    const cartProducts = this.props.cartProducts;
    let classes = ['float-cart'];

    let numProducts = 0;
    for (let i = 0; i < cartProducts.length; i++) {
              numProducts += cartProducts[i].quantity;
    }

    const products = cartProducts.map(p => {
      return (
        <CartProduct product={p} removeProduct={(p) => this.removeProduct(p)} key={p.id} />
      );
    });

        if (!!this.state.isOpen) {
          classes.push('float-cart--open');
        }

        return (
          <div className={classes.join(' ')}>
            {/* If cart open, show close (x) button */}
            {this.state.isOpen && (
              <div
                onClick={() => this.closeFloatCart()}
                className="float-cart__close-btn"
              >
                X
              </div>
            )}

            {/* If cart is closed, show bag with quantity of product and open cart action */}
        {!this.state.isOpen && (
          <span
            onClick={() => this.openFloatCart()}
            className="bag bag--float-cart-closed"
          >
            <span className="bag__quantity">{numProducts}</span>
          </span>
        )}

        <div className="float-cart__content">
          <div className="float-cart__header">
            <span className="bag">
              <span className="bag__quantity">{numProducts}</span>
            </span>
            <span className="header-title">Cart</span>
          </div>

          <div className="float-cart__shelf-container">
            {products}
            {!products.length && (
              <p className="shelf-empty">
                Add some products in the cart <br />
                ^^
              </p>
            )}
          </div>

          <div className="float-cart__footer">
            <div className="sub">SUBTOTAL</div>
            <div className="sub-price">
              <p className="sub-price__val">
                {totalPrice(cartProducts).toFixed(2)}
              </p>
            </div>
            <div className="buy-btn">
              Checkout
            </div>
          </div>
        </div>
      </div>
    );
  }


}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inventory: jsonResponse.products,
      cartProducts: [],
      productToAdd: null,
      productToRemove: null,
    };
  }

  handleAddToCartButton(prod, size) {
    let product = Object.assign({}, prod);
    product.quantity = 1; // default behavior of add to cart button
    product.size = size;
    product.key = Math.random(); // default behavior of add to cart button
    this.setState({
      productToAdd: product,
    });
  }

  updateCart(cartProducts) {
    this.setState({
      cartProducts: cartProducts,
    });
    console.log('updateCart');
    console.log(this.state);
  }

  render() {
    return (
      <div className="App">
        <main>
          <Sidebar />
          <Canvas
            handleAddToCartButton={(prod, size) => this.handleAddToCartButton(prod, size)}
            inventory={this.state.inventory}
          />
        </main>
        <FloatCart
          cartProducts={this.state.cartProducts.slice()}
          updateCart={(cP) => this.updateCart(cP)}
          productToAdd={this.state.productToAdd}
          productToRemove={this.state.productToRemove}
        />
      </div>
    );
  }
}

function totalPrice(cartProducts) {
  let total = 0.0;
  for (let i = 0; i < cartProducts.length; i++) {
    total += cartProducts[i].quantity * cartProducts[i].price;
  }
  return total;
}


const jsonResponse = {
  "products": [
    {
      "id": 12,
      "sku": 12064273040195392,
      "title": "Cat Tee Black T-Shirt",
      "description": "4 MSL",
      "availableSizes": {"S": 3, "XS": 5},
      "style": "Black with custom print",
      "price": 10.9,
      "installments": 9,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 13,
      "sku": 51498472915966366,
      "title": "Dark Thug Blue-Navy T-Shirt",
      "description": "",
      "availableSizes": {"M": 2},
      "style": "Front print and paisley print",
      "price": 29.45,
      "installments": 5,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 14,
      "sku": 10686354557628303,
      "title": "Sphynx Tie Dye Wine T-Shirt",
      "description": "GPX Poly 1",
      "availableSizes": {"X": 3, "L": 1, "XL": 5},
      "style": "Front tie dye print",
      "price": 9.0,
      "installments": 3,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 15,
      "sku": 11033926921508487,
      "title": "Skuul",
      "description": "Treino 2014",
      "availableSizes": {"X": 4, "L": 2, "XL": 3, "XXL": 1},
      "style": "Black T-Shirt with front print",
      "price": 14.0,
      "installments": 5,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 11,
      "sku": 39876704341265606,
      "title": "Wine Skul T-Shirt",
      "description": "",
      "availableSizes": {"X": 5, "L": 2},
      "style": "Wine",
      "price": 13.25,
      "installments": 3,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 16,
      "sku": 10412368723880253,
      "title": "Short Sleeve T-Shirt",
      "description": "",
      "availableSizes": {"XS": 3, "X": 4, "L": 5, "ML": 1, "XL": 1},
      "style": "Grey",
      "price": 75.0,
      "installments": 5,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 0,
      "sku": 8552515751438644,
      "title": "Cat Tee Black T-Shirt",
      "description": "14/15 s/nº",
      "availableSizes": {"X": 2, "L": 4, "XL": 3, "XXL": 5},
      "style": "Branco com listras pretas",
      "price": 10.9,
      "installments": 9,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 1,
      "sku": 18644119330491312,
      "title": "Sphynx Tie Dye Grey T-Shirt",
      "description": "14/15 s/nº",
      "availableSizes": {"X": 4, "L": 3, "XL": 2, "XXL": 1},
      "style": "Preta com listras brancas",
      "price": 10.9,
      "installments": 9,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 2,
      "sku": 11854078013954528,
      "title": "Danger Knife Grey",
      "description": "14/15 s/nº",
      "availableSizes": {"X": 2, "L": 3},
      "style": "Branco com listras pretas",
      "price": 14.9,
      "installments": 7,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 3,
      "sku": 876661122392077,
      "title": "White DGK Script Tee",
      "description": "2014 s/nº",
      "availableSizes": {"X": 1, "L": 3},
      "style": "Preto com listras brancas",
      "price": 14.9,
      "installments": 7,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 4,
      "sku": 9197907543445677,
      "title": "Born On The Streets",
      "description": "14/15 s/nº - Jogador",
      "availableSizes": {"XL": 2},
      "style": "Branco com listras pretas",
      "price": 25.9,
      "installments": 12,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": false
    },

    {
      "id": 5,
      "sku": 10547961582846888,
      "title": "Tso 3D Short Sleeve T-Shirt A",
      "description": "14/15 + Camiseta 1º Mundial",
      "availableSizes": {"X": 3, "L": 2, "XL": 1},
      "style": "Preto",
      "price": 10.9,
      "installments": 9,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": false
    },

    {
      "id": 6,
      "sku": 6090484789343891,
      "title": "Man Tie Dye Cinza Grey T-Shirt",
      "description": "Goleiro 13/14",
      "availableSizes": {"XL": 2, "XXL": 2},
      "style": "Branco",
      "price": 49.9,
      "installments": 0,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 7,
      "sku": 18532669286405342,
      "title": "Crazy Monkey Black T-Shirt",
      "description": "1977 Infantil",
      "availableSizes": {"S": 2},
      "style": "Preto com listras brancas",
      "price": 22.5,
      "installments": 4,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 8,
      "sku": 5619496040738316,
      "title": "Tso 3D Black T-Shirt",
      "description": "",
      "availableSizes": {"XL": 1},
      "style": "Azul escuro",
      "price": 18.7,
      "installments": 4,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": false
    },

    {
      "id": 9,
      "sku": 11600983276356165,
      "title": "Crazy Monkey Grey",
      "description": "",
      "availableSizes": {"L": 2, "XL": 2},
      "style": "",
      "price": 134.9,
      "installments": 5,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    },

    {
      "id": 10,
      "sku": 27250082398145995,
      "title": "On The Streets Black T-Shirt",
      "description": "",
      "availableSizes": {"L": 4, "XL": 3},
      "style": "",
      "price": 49.0,
      "installments": 9,
      "currencyId": "USD",
      "currencyFormat": "$",
      "isFreeShipping": true
    }
  ]
};


export default App;
