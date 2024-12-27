import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Crear algunas categorías
  const category1 = await prisma.category.create({
    data: {
      categoryId: uuid(),
      name: 'Electronics',
      description: 'Electronic gadgets and devices',
    },
  });

  const category2 = await prisma.category.create({
    data: {
      categoryId: uuid(),
      name: 'Clothing',
      description: 'Fashion and apparel',
    },
  });

  // Crear un usuario
  await prisma.user.create({
    data: {
      userId: uuid(),
      email: 'user@example.com',
      name: 'John',
      lastName: 'Doe',
      phoneNumber: '123456789',
      password: 'securepassword',
      role: 'CLIENT',
    },
  });

  // Crear productos asociados a categorías
  await prisma.product.create({
    data: {
      productId: uuid(),
      name: 'Smartphone',
      description: 'Latest model smartphone with great features',
      price: 699.99,
      stock: 100,
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
