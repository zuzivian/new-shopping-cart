import React, { Component } from 'react';
import './App.scss';
import firebase, { auth } from './fire.js';
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

let compare = function (a, b)
  {
    if (a.toString() < b.toString()) return -1;
    if (a.toString() > b.toString()) return 1;
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
  uiConfig = {
    signInFlow: "redirect",
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
  };

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
        {this.props.user ?
          <div>
          <h4>Logout</h4>
          <button onClick={this.props.logout}>Log Out</button>
          </div>
          :
          <div>
            <h4>Login</h4>
            <StyledFirebaseAuth
              uiConfig={this.uiConfig}
              firebaseAuth={auth}
            />
          </div>
        }
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
    const cartProducts = this.props.cartProducts;

    const buyButtons = Object.keys(product.availableSizes).map((size) => {
      let cartprod = cartProducts.find((cP) => { return cP.sku === product.sku && cP.size === size});
      let qty = product.availableSizes[size];
      if (cartprod) qty -= cartprod.quantity;
      if (qty <= 0) return ('');
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
    var filteredProducts = [];

    if (products.length) {
       filteredProducts = products.filter((p) => {
        const sizes = Object.keys(p.availableSizes);
        for (let i = 0; i < sizes.length; i++) {
          if (filteredSizes.has(sizes[i])) {
            return true;
          }
        }
        return false;
      });
    }

    if (filteredSizes.size <= 0) filteredProducts = products;
    let productListing = "";

    if (filteredProducts.length) {
      filteredProducts = filteredProducts.filter(p => {
        return Object.keys(p.availableSizes).length > 0;
      });

      productListing = filteredProducts.map((key, val) => {
        let p = filteredProducts[val];
        return (
          <Product
            key={p.id}
            product={p}
            cartProducts={this.props.cartProducts}
            handleButtonClick={(sz) => this.props.handleAddToCartButton(p, sz)}
          />
        );
      });
    }

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
    let productAlreadyInCart = false;

    cartProducts.forEach(cp => {
      if (cp.id === product.id && compare(product.size, cp.size) === 0) {
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

    var index = cartProducts.findIndex(p => (p.id === product.id && p.size.compare(product.size) === 0));
    if (index >= 0) {
      if (--cartProducts[index].quantity <= 0) {
        cartProducts.splice(index, 1);
      }
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
            <div
              className="buy-btn"
              onClick={() => this.props.purchaseCart(totalPrice(cartProducts).toFixed(2))}
            >
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
      inventory: [],
      cartProducts: [],
      user: null,
      productToAdd: null,
      productToRemove: null,
      filteredSizes: new Set(),
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          user: user,
        });
      }
    });

    let ref = firebase.database().ref('products');
    ref.on("value", (data) => {
      let products = [];
      data.forEach((child) => {
          products.push(child.val());
      });
      this.setState({
          inventory: products,
      });
    });

    firebase.database().ref('users/').on("value", (data) => {
      let found_user = false;
      if (!this.state.user) return;
      data.forEach((child) => {
        if (child.val().uid === this.state.user.uid) {
          found_user = true;
          if (child.val().cartProducts) {
            this.setState({
              cartProducts: child.val().cartProducts,
            });
          } else {
            this.setState({
              cartProducts: [],
            });
          }
        }
      });

      if (!found_user) {
        let newUser = {
          uid: this.state.user.uid
        };
        let updates = {};
        updates['/users/' + newUser.uid] = newUser;
        firebase.database().ref().update(updates);
      }
    });
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
    let updatedUser = {
      uid: this.state.user.uid,
      cartProducts: cartProducts
    };
    let updates = {};
    updates['/users/' + this.state.user.uid] = updatedUser;
    firebase.database().ref().update(updates);
    // this.setState({
    //   cartProducts: cartProducts,
    // });
  }

  updateInventory(inventory) {
    this.setState({
      inventory: inventory,
    });
  }

  logout() {
    firebase.auth().signOut().then(() => {
      this.setState({
        user: null
      });
    });
  }

  purchaseCart(total) {

    let cartProducts = this.state.cartProducts;
    let inventory = this.state.inventory;

    for (let i=0; i < cartProducts.length; i++) {
      let item = inventory.find(p => { return cartProducts[i].sku === p.sku });
      item.availableSizes[cartProducts[i].size] -= cartProducts[i].quantity;
      if (item.availableSizes[cartProducts[i].size] <= 0) {
        item.availableSizes[cartProducts[i].size] = null;
      }
    }

    alert("Thank you for patronising the shop. Your total : $" + total);
    let updatedUser = {
      uid: this.state.user.uid,
    };
    let updates = {};
    updates['/users/' + this.state.user.uid] = updatedUser;
    updates['/products/'] = this.state.inventory;
    firebase.database().ref().update(updates);
  }

  render() {
    if (!this.state.user)
      return (
        <div className="App">
          <Sidebar
            handleToggleFilterSize={(size) => this.handleToggleFilterSize(size)}
            logout={() => this.logout()}
            user={this.state.user}
          />
        </div>
      );
    return (
      <div className="App">
          <Sidebar
            handleToggleFilterSize={(size) => this.handleToggleFilterSize(size)}
            logout={() => this.logout()}
            user={this.state.user}
          />
          <Canvas
            handleAddToCartButton={(prod, size) => this.handleAddToCartButton(prod, size)}
            inventory={this.state.inventory}
            cartProducts={this.state.cartProducts}
            filteredSizes={this.state.filteredSizes}
          />
        <FloatCart
          cartProducts={this.state.cartProducts.slice()}
          updateCart={(cP) => this.updateCart(cP)}
          inventory={this.state.inventory}
          updateInventory={(inv) => this.updateInventory(inv)}
          productToAdd={this.state.productToAdd}
          productToRemove={this.state.productToRemove}
          purchaseCart={(total) => this.purchaseCart(total)}
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


export default App;
