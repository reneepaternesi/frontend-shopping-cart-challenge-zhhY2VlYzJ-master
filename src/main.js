/**
 * Attention, do you like Typescript?
 * Just rename this file from .js to .ts and enjoy Type Safety.
 */

import "./styles/reset.css";
import "./styles/main.css";
import { getCheckout } from "./getCheckout";

/**
 * @description Given product list.
 */
let products;
let checkout;
let discounts;

/**
 * @description Products dictionary to update quantity.
 */
const productsQuantity = {};

/**
 * @description Setup for productsQuantity variable. Taking values from query params to easy debug.
 */
function init() {
  ({ products, checkout, discounts } = getCheckout());

  const queryParams = new URLSearchParams(window.location.search);

  for (let productIndex = 0; productIndex < products.length; productIndex++) {
    const currentProduct = products[productIndex];

    const value = Number(
      queryParams.get(`${currentProduct.id}_quantity`) || "0"
    );

    productsQuantity[currentProduct.id] = value;

    if (value > 0) {
      for (let loopIndex = 0; loopIndex < value; loopIndex++) {
        checkout.scan(currentProduct.id, productsQuantity[currentProduct.id]);
      }
    }
  }
}

/**
 * @description Update total HTML nodes to display quantity selected and total price before promotions
 */
function updateTotal() {
  let total = 0;
  let quantity = 0;

  for (let index = 0; index < products.length; index++) {
    const { id, price } = products[index];
    total += price * productsQuantity[id];
    quantity += productsQuantity[id];
  }

  const $total = document.getElementById(`checkout_total`);
  const $quantity = document.getElementById(`checkout_quantity`);

  if ($total) $total.innerHTML = total + " €";
  if ($quantity) $quantity.innerHTML = quantity + " Items";
}

function updateTotalWithDiscount() {
  const $total = document.getElementById(`checkout_finalTotal`);

  if ($total) $total.innerHTML = checkout.total() + " €";
}

/**
 * @description Update discpunts amounts
 */
function updateDiscounts() {
  for (let index = 0; index < products.length; index++) {
    const currentProduct = products[index];
    const qty = productsQuantity[currentProduct.id]
    let priceWithDiscount = 0
    const $discount = document.getElementById(`${currentProduct.id}_discount`);

    for (let j = 0; j < discounts.length; j++) {
      const currentDiscount = discounts[j];

      if (currentDiscount.products.find((productDiscount) => productDiscount === currentProduct.id) && qty >= currentDiscount.minQuantityRequired) {
        priceWithDiscount += checkout.applyDiscount(qty, currentProduct.price, currentDiscount);
      }
    }

    const discount = priceWithDiscount ? (currentProduct.price * qty) - priceWithDiscount : 0
    if ($discount) $discount.innerHTML =  discount + " €";
  }
}

/**
 * @description Update every rows values HTML nodes.
 */
function updateRowsValues(summary = productsQuantity) {
  for (let index = 0; index < products.length; index++) {
    const currentProduct = products[index];

    const $total = document.getElementById(`${currentProduct.id}_total`);
    const $quantity = document.getElementById(`${currentProduct.id}_quantity`);

    if ($total)
      $total.innerHTML =
        currentProduct.price * summary[currentProduct.id] + " €";

    if ($quantity) $quantity.value = summary[currentProduct.id]?.toString();
  }

  updateDiscounts();
  updateTotal();
}

function substract(event) {
  event.preventDefault();
  const currentTarget = event.currentTarget;

  const [id] = currentTarget?.id.split("_");

  if (productsQuantity[id] > 0) {
    productsQuantity[id]--;
    checkout.scan(id, productsQuantity[id])
  }

  updateRowsValues();
}

function add(event) {
  event.preventDefault();
  const currentTarget = event.currentTarget;

  const [id] = currentTarget.id.split("_");

  productsQuantity[id]++;
  
  checkout.scan(id, productsQuantity[id])

  updateRowsValues();

  hideProductModal();
}

function onChangeInput(event) {
  const currentTarget = event.currentTarget;

  const [id] = currentTarget.id.split("_");
  productsQuantity[id] = Number(currentTarget.value);
  updateRowsValues();
}

function total(event) {
  checkout.total()
}

/**
 * @description Set modal content based on selected product
 * @param {*} event 
 */
function setProductModal(event) {
  event.preventDefault();
  const currentTarget = event.currentTarget;
  const [id] = currentTarget.id.split("_");

  const currentProduct = products.find((product) => product.id === id)

  if (currentProduct) {
    const $productImg = document.getElementById("product_img")
    const $productName = document.getElementById("product_name")
    const $productPrice = document.getElementById("product_price")
    const $productDesc = document.getElementById("product_description")
    const $productCode = document.getElementById("product_code")
    const $modalBtn = document.querySelector('.add-to-cart-btn');

    $productImg.setAttribute("src", `/${currentProduct.id}.jpg`)
    $productImg.setAttribute("alt", `${currentProduct.name}`);
    $productName.innerHTML = currentProduct.name;
    $productPrice.innerHTML = currentProduct.price + " €"
    $productDesc.innerHTML = currentProduct.desciption
    $productCode.innerHTML = currentProduct.id

    // add product id to button in order to be abel to run add function on click
    $modalBtn.setAttribute("id", `${currentProduct.id}_addToCart`)

    $modalBtn.addEventListener("click", add);

    showProductModal()
  }

}

/**
 * @description Show product modal
 * @param {*} event 
 */
function showProductModal(event) {
  const $modal = document.getElementById("product-modal")
  if ($modal.classList.contains("hidden")) {
    $modal.classList.remove("hidden");
  }
  $modal.classList.add('visible')
}

/**
 * @description Hide product modal
 * @param {*} event 
 */
function hideProductModal(event) {
  const $modal = document.getElementById("product-modal")
  if ($modal.classList.contains("visible")) {
    $modal.classList.remove("visible");
  }
  $modal.classList.add('hidden')
}

/**
 * @description Bind UI buttons
 */
function bindButtons() {
  for (let index = 0; index < products.length; index++) {
    const { id } = products[index];

    // Bind substract button.
    document
      .getElementById(`${id}_substract`)
      ?.addEventListener("click", substract);

    // Bind add button.
    document.getElementById(`${id}_add`)?.addEventListener("click", add);

    // Bind quantity input.
    document
      .getElementById(`${id}_quantity`)
      ?.addEventListener("change", onChangeInput);
    
    // Bind open modal
    document
      .getElementById(`${id}_figure`)
      ?.addEventListener("click", setProductModal);
    
    // bind close modal
    document.getElementById("close_btn")?.addEventListener("click", hideProductModal);
  }

  // Bind checkout button
  document.getElementById("checkout_btn")?.addEventListener("click", total)
}

/**
 * @description Run the application.
 */
function run() {
  // Init values
  init();

  // Put values
  updateRowsValues(productsQuantity);

  updateTotalWithDiscount();

  // Bind buttons
  bindButtons();
}

run();
