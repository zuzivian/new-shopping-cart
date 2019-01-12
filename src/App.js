import React, { Component } from 'react';
import './App.scss';

String.prototype.compare = function (a)
  {
    if (a.toString() > this.toString()) return -1;
    if (a.toString() < this.toString()) return 1;
    return 0;
  };

class SizeButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toggled: false,
    }
  }

  toggleCheckboxChange = () => {
    this.setState(({ toggled }) => ({
      toggled: !toggled
    }));
    this.props.handleToggleFilterSize();
  };

  render() {
    return (
      <div className="filters-available-size">
      <label>
        <input
          type="checkbox"
          value={this.props.size}
          checked={this.state.toggled}
          onChange={this.toggleCheckboxChange}
        />
        <span className="checkmark">{this.props.size}</span>
      </label>
      </div>
    );
  }
}

class Sidebar extends Component {
  render() {
    const sizes = ["XS", "S", "M", "X", "ML", "L", "XL", "XXL"];
    const sizeButtons = sizes.map((sz) => {
      return(
        <SizeButton
          key={sz}
          size={sz}
          handleToggleFilterSize={() => this.props.handleToggleFilterSize(sz)}
        />
      );
    });

    return (
      <div className="filters">
        <h4 className="title">Sizes:</h4>
        {sizeButtons}
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
          key={size}
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.filteredSizes !== this.props.filteredSizes) {
      this.forceUpdate();
    }

    if (nextProps.inventory !== this.props.inventory) {
      this.forceUpdate();
    }
  }

  render() {
    const products = this.props.inventory;
    var filteredSizes = this.props.filteredSizes;

    var filteredProducts = products.filter((p) => {
      const sizes = Object.keys(p.availableSizes);
      for (let i = 0; i < sizes.length; i++) {
        if (filteredSizes.has(sizes[i])) {
          return true;
        }
      }
      return false;
    });

    if (filteredSizes.size <= 0) filteredProducts = products;

    filteredProducts = filteredProducts.filter(p => {
      return Object.keys(p.availableSizes).length > 0;
    });

    const productListing = filteredProducts.map((key, val) => {
      let p = filteredProducts[val];
      return (
        <Product
          key={p.id}
          product={p}
          handleButtonClick={(sz) => this.props.handleAddToCartButton(p, sz)}
        />
      );
    });

    return (
      <div className="shelf-container">
        <div className="shelf-container-header">
          <div className="products-found">
          {filteredProducts.length} products found.
          </div>
        </div>
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
            {`${product.size} | ${product.style}`} <br />
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

    if (nextProps.cartProducts !== this.props.cartProducts) {
      this.forceUpdate();
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
    const inventory = this.props.inventory;
    const updateInventory = this.props.updateInventory;
    let productAlreadyInCart = false;

    cartProducts.forEach(cp => {
      if (cp.id === product.id && cp.size.compare(product.size) === 0) {
        cp.quantity += product.quantity;
        productAlreadyInCart = true;
      }
    });

    if (!productAlreadyInCart) {
      cartProducts.push(product);
    }

    // inventory update
    inventory.splice();
    const index = inventory.findIndex(p => (p.id === product.id));
    if (index >= 0) {
      inventory[index].availableSizes[product.size]--;
      if (inventory[index].availableSizes[product.size] <= 0)
        delete inventory[index].availableSizes[product.size];
      updateInventory(inventory);
    }


    updateCart(cartProducts);
    this.openFloatCart();
  };

  removeProduct = product => {
    const cartProducts = this.props.cartProducts;
    const updateCart = this.props.updateCart;
    const inventory = this.props.inventory;
    const updateInventory = this.props.updateInventory;

    var index = cartProducts.findIndex(p => (p.id === product.id && p.size.compare(product.size) === 0));
    if (index >= 0) {
      if (--cartProducts[index].quantity <= 0) {
        cartProducts.splice(index, 1);
      }
      updateCart(cartProducts);
    }
    inventory.splice();
    index = inventory.findIndex(p => (p.id === product.id));
    if (index >= 0) {
      if (!inventory[index].availableSizes.hasOwnProperty(product.size))
        inventory[index].availableSizes[product.size] = 0;
      inventory[index].availableSizes[product.size]++;
      updateInventory(inventory);
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
        <CartProduct product={p} removeProduct={(p) => this.removeProduct(p)} key={Math.random()} />
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
      filteredSizes: new Set(),
    };
  }

  handleToggleFilterSize(size) {
    var fSizes = this.state.filteredSizes;
    if (fSizes.has(size)) {
      fSizes.delete(size);
    } else {
      fSizes.add(size);
    }
    this.setState({
      filteredSizes: fSizes,
    });
    return;
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
    console.log(cartProducts);
  }

  updateInventory(inventory) {
    this.setState({
      inventory: inventory,
    });
  }

  render() {
    return (
      <div className="App">
        <main>
          <Sidebar handleToggleFilterSize={(size) => this.handleToggleFilterSize(size)}/>
          <Canvas
            handleAddToCartButton={(prod, size) => this.handleAddToCartButton(prod, size)}
            inventory={this.state.inventory}
            filteredSizes={this.state.filteredSizes}
          />
        </main>
        <FloatCart
          cartProducts={this.state.cartProducts.slice()}
          updateCart={(cP) => this.updateCart(cP)}
          inventory={this.state.inventory}
          updateInventory={(inv) => this.updateInventory(inv)}
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
