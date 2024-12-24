CREATE TYPE user_roles_enum AS ENUM ('MANAGER', 'CLIENT');
CREATE TABLE customer_user (
  user_id UUID NOT NULL,
  role user_roles_enum NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  password TEXT,
  address TEXT,
  reset_password_token TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  reset_password_expires_at TIMESTAMP,
  created_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (user_id)
);

CREATE TABLE product (
  product_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  stock NUMERIC,
  is_active BOOLEAN DEFAULT TRUE,
  price NUMERIC(10,2) NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (product_id)
);

CREATE TABLE category (
  category_id UUID NOT NULL,
  name VARCHAR(100),
  description TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (category_id)
);

CREATE TABLE product_category (
  product_id UUID NOT NULL,
  category_id UUID NOT NULL,

  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES product(product_id),
  FOREIGN KEY (category_id) REFERENCES category(category_id)
);

CREATE TABLE product_image (
  product_image_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES product(product_id),
  url TEXT NOT NULL,

  PRIMARY KEY (product_image_id)
);

CREATE TABLE product_like (
  product_id UUID NOT NULL REFERENCES product(product_id),
  user_id UUID NOT NULL REFERENCES customer_user(user_id),
  created_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (product_id, user_id)
);

CREATE TABLE cart (
  user_id UUID NOT NULL REFERENCES customer_user(user_id),

  PRIMARY KEY (user_id)
);

CREATE TABLE cart_detail (
  user_id UUID NOT NULL REFERENCES cart(user_id),
  product_id UUID NOT NULL REFERENCES product(product_id),
  quantity INT,
  created_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (user_id, product_id)
);

CREATE TYPE order_status_enum AS ENUM ('PAID', 'PENDING');
CREATE TABLE "order" (
  order_id UUID NOT NULL,
  status order_status_enum NOT NULL,
  user_id UUID NOT NULL REFERENCES customer_user(user_id),
  total NUMERIC,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (order_id)
);

CREATE TABLE order_detail (
  order_detail_id INT,
  order_id UUID NOT NULL  REFERENCES "order"(order_id),
  product_id UUID NOT NULL  REFERENCES product(product_id),
  quantity INT,
  unit_price NUMERIC(12, 2),
  subtotal NUMERIC,

  PRIMARY KEY (order_detail_id)
);

CREATE TYPE payment_status_enum AS ENUM ('PAID', 'PENDING', 'FAILED');

CREATE TABLE payment (
  payment_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES "order"(order_id),
  stripe_payment_id VARCHAR(255) UNIQUE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  status payment_status_enum NOT NULL DEFAULT 'PENDING',
  payment_at TIMESTAMP(3) WITH TIME ZONE,
  created_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (payment_id)
);

CREATE TYPE priority_enum AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE status_enum AS ENUM ('READ','UNREAD');
CREATE TYPE notification_type_enum AS ENUM ('EMAIL','SMS','WHATSAPP');

CREATE TABLE notification (
  notification_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES customer_user(user_id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority priority_enum NOT NULL DEFAULT 'NORMAL',
  status status_enum DEFAULT 'UNREAD',
  type notification_type_enum DEFAULT 'EMAIL',
  created_at TIMESTAMP DEFAULT NOW(),
  send_at TIMESTAMP,
  read_at TIMESTAMP,

  PRIMARY KEY (notification_id)
);
