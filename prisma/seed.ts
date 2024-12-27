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
      productCategories: {
        create: [
          {
            categoryId: category1.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category1.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category1.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category2.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category2.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category2.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category3.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category3.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category3.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category4.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category4.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category5.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category5.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category5.categoryId,
          },
        ],
      },
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
      productCategories: {
        create: [
          {
            categoryId: category2.categoryId,
          },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'user@example.com',
      name: 'John',
      lastName: 'Doe',
      phoneNumber: '123456789',
      password: bcrypt.hashSync('Secure123', 10),
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
