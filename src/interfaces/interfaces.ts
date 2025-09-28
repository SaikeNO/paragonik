export interface Tag {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
}

export interface Receipt {
  id: string;
  fileUrl: string;
  date: string;
  tags: Tag[];
  items: Item[];
  createdAt: string;
}
