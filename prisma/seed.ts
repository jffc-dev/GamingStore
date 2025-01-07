import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const category1 = await prisma.category.create({
    data: {
      categoryId: uuid(),
      name: 'Consoles',
      description: 'Gaming consoles and accessories',
    },
  });

  const category2 = await prisma.category.create({
    data: {
      categoryId: uuid(),
      name: 'PC Gaming',
      description: 'PC gaming equipment and accessories',
    },
  });

  const category3 = await prisma.category.create({
    data: {
      categoryId: uuid(),
      name: 'Games',
      description: 'Latest and classic video games',
    },
  });

  const category4 = await prisma.category.create({
    data: {
      categoryId: uuid(),
      name: 'Gaming Chairs',
      description: 'Comfortable chairs designed for gaming',
    },
  });

  const category5 = await prisma.category.create({
    data: {
      categoryId: uuid(),
      name: 'Merchandise',
      description: 'Gaming-related clothing and collectibles',
    },
  });

  // Crear productos para cada categoría
  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'PlayStation 5',
      description: 'Next-gen console with ultra-fast SSD and 4K gaming support',
      price: 499.99,
      stock: 50,
      isActive: true,
      categoryId: category1.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Xbox Series X',
      description: 'Powerful gaming console with support for 4K and 8K gaming',
      price: 499.99,
      stock: 30,
      isActive: true,
      categoryId: category1.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Nintendo Switch OLED',
      description:
        'Portable console with enhanced screen and better battery life',
      price: 349.99,
      stock: 70,
      isActive: true,
      categoryId: category1.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Gaming Laptop',
      description: 'High-performance laptop with NVIDIA RTX graphics card',
      price: 1199.99,
      stock: 25,
      isActive: true,
      categoryId: category2.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Mechanical Keyboard',
      description: 'RGB backlit keyboard with customizable keys',
      price: 89.99,
      stock: 100,
      isActive: true,
      categoryId: category2.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Wireless Gaming Mouse',
      description: 'Ergonomic mouse with adjustable DPI settings',
      price: 59.99,
      stock: 150,
      isActive: true,
      categoryId: category2.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Call of Duty: Modern Warfare II',
      description: 'First-person shooter game with immersive graphics',
      price: 69.99,
      stock: 200,
      isActive: true,
      categoryId: category3.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'The Legend of Zelda: Breath of the Wild',
      description: 'Open-world adventure game for the Nintendo Switch',
      price: 59.99,
      stock: 120,
      isActive: true,
      categoryId: category3.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Cyberpunk 2077',
      description: 'Role-playing game set in a dystopian future',
      price: 39.99,
      stock: 180,
      isActive: true,
      categoryId: category3.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Ergonomic Gaming Chair',
      description:
        'High-back chair with lumbar support and adjustable armrests',
      price: 249.99,
      stock: 60,
      isActive: true,
      categoryId: category4.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Racing-Style Gaming Chair',
      description: 'Comfortable chair with reclining backrest and footrest',
      price: 199.99,
      stock: 40,
      isActive: true,
      categoryId: category4.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Gamer Hoodie',
      description: 'Stylish hoodie with gaming-themed designs',
      price: 49.99,
      stock: 80,
      isActive: true,
      categoryId: category5.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Gaming Poster Set',
      description: 'Posters featuring popular games',
      price: 19.99,
      stock: 150,
      isActive: true,
      categoryId: category5.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Collector’s Edition Figure',
      description: 'Limited-edition figure of a beloved gaming character',
      price: 129.99,
      stock: 15,
      isActive: true,
      categoryId: category5.categoryId,
    },
  });

  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'T-Shirt',
      description: 'Comfortable cotton t-shirt',
      price: 19.99,
      stock: 200,
      isActive: true,
      categoryId: category2.categoryId,
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'user@example.com',
      name: 'John',
      lastName: 'Doe',
      phoneNumber: '123456789',
      password: bcrypt.hashSync('Javier123', 10),
      role: 'CLIENT',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'javier@example.com',
      name: 'Javier',
      lastName: 'Flores',
      phoneNumber: '987654321',
      password: bcrypt.hashSync('Javier123', 10),
      role: 'MANAGER',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'ana@example.com',
      name: 'Ana',
      lastName: 'Martínez',
      phoneNumber: '987654310',
      password: bcrypt.hashSync('Ana123', 10),
      role: 'CLIENT',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'carlos@example.com',
      name: 'Carlos',
      lastName: 'Gómez',
      phoneNumber: '987654320',
      password: bcrypt.hashSync('Carlos123', 10),
      role: 'CLIENT',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'luisa@example.com',
      name: 'Luisa',
      lastName: 'Pérez',
      phoneNumber: '987654330',
      password: bcrypt.hashSync('Luisa123', 10),
      role: 'CLIENT',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'fernando@example.com',
      name: 'Fernando',
      lastName: 'Ruiz',
      phoneNumber: '987654340',
      password: bcrypt.hashSync('Fernando123', 10),
      role: 'CLIENT',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'valeria@example.com',
      name: 'Valeria',
      lastName: 'Hernández',
      phoneNumber: '987654350',
      password: bcrypt.hashSync('Valeria123', 10),
      role: 'CLIENT',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'andres@example.com',
      name: 'Andrés',
      lastName: 'López',
      phoneNumber: '987654360',
      password: bcrypt.hashSync('Andres123', 10),
      role: 'CLIENT',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'paula@example.com',
      name: 'Paula',
      lastName: 'Morales',
      phoneNumber: '987654370',
      password: bcrypt.hashSync('Paula123', 10),
      role: 'CLIENT',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'jorge@example.com',
      name: 'Jorge',
      lastName: 'Ramírez',
      phoneNumber: '987654380',
      password: bcrypt.hashSync('Jorge123', 10),
      role: 'CLIENT',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'diana@example.com',
      name: 'Diana',
      lastName: 'Salazar',
      phoneNumber: '987654390',
      password: bcrypt.hashSync('Diana123', 10),
      role: 'CLIENT',
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'mario@example.com',
      name: 'Mario',
      lastName: 'Vargas',
      phoneNumber: '987654400',
      password: bcrypt.hashSync('Mario123', 10),
      role: 'CLIENT',
    },
  });

  console.log('Seed data inserted');
}

// Ejecutar la función principal
main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
