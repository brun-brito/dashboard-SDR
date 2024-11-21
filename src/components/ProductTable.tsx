import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { TrashIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/16/solid";

interface Product {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  marca: string;
  categoria: string;
}

const ProductTable: React.FC = () => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    nome: "",
    preco: "",
    quantidade: "",
    marca: "",
    categoria: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    const productList: Product[] = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Product;
      return {
        ...data,
        id: doc.id,
      };
    });

    productList.sort((a, b) => a.nome.localeCompare(b.nome));
    setProducts(productList);
    setFilteredProducts(productList);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredProducts(
      products.filter(
        (product) =>
          product.nome.toLowerCase().includes(query) ||
          product.marca.toLowerCase().includes(query) ||
          product.categoria.toLowerCase().includes(query)
      )
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((product) => product.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((productId) => productId !== id)
        : [...prevSelected, id]
    );
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "produtos", id));
    fetchProducts();
  };

  const deleteSelectedProducts = async () => {
    if (selectedProducts.length === 0) return;

    const userConfirmed = window.confirm(
      `Tem certeza de que deseja apagar os ${selectedProducts.length} produtos selecionados?`
    );

    if (!userConfirmed) return;

    setIsLoading(true);
    try {
      for (const productId of selectedProducts) {
        await deleteDoc(doc(db, "produtos", productId));
      }
      alert("Produtos selecionados excluídos com sucesso.");
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error("Erro ao excluir produtos:", error);
      alert("Erro ao excluir produtos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, updatedData: any) => {
    await updateDoc(doc(db, "produtos", id), updatedData);
    setEditingProduct(null);
    fetchProducts();
  };

  const addProduct = async () => {
    if (!newProduct.nome || !newProduct.preco || !newProduct.quantidade || !newProduct.marca) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

    try {
      await addDoc(collection(db, "produtos"), {
        nome: newProduct.nome,
        preco: parseFloat(newProduct.preco),
        quantidade: parseInt(newProduct.quantidade),
        marca: newProduct.marca,
        categoria: newProduct.categoria || "Sem categoria",
      });

      alert("Produto adicionado com sucesso!");
      setNewProduct({ nome: "", preco: "", quantidade: "", marca: "", categoria: "" });
      fetchProducts();
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      alert("Erro ao adicionar produto.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-4/5 bg-white shadow-xl rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Tabela de Produtos</h2>
        {/* Botão e Barra de Pesquisa */}
        <div className="action-bar">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Pesquise por nome, marca ou categoria..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <MagnifyingGlassIcon className="search-icon" />
          </div>
        </div>
        
        <div className="mb-6">
          {/* Botão para adicionar produto */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="add-produto flex items-center gap-2 text-white px-4 py-2 rounded"
            >
              
              <PlusIcon className="plus-icon" />
              Adicionar Produto
            </button>
          )}

          {/* Formulário de adição de produtos */}
          {showForm && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <input
                type="text"
                placeholder="Nome do Produto"
                value={newProduct.nome}
                onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })}
                className="border border-gray-300 rounded p-2 w-full"
              />
              <input
                type="number"
                placeholder="Preço"
                value={newProduct.preco}
                onChange={(e) => setNewProduct({ ...newProduct, preco: e.target.value })}
                className="border border-gray-300 rounded p-2 w-full"
              />
              <input
                type="number"
                placeholder="Quantidade"
                value={newProduct.quantidade}
                onChange={(e) => setNewProduct({ ...newProduct, quantidade: e.target.value })}
                className="border border-gray-300 rounded p-2 w-full"
              />
              <input
                type="text"
                placeholder="Marca"
                value={newProduct.marca}
                onChange={(e) => setNewProduct({ ...newProduct, marca: e.target.value })}
                className="border border-gray-300 rounded p-2 w-full"
              />
              <input
                type="text"
                placeholder="Categoria"
                value={newProduct.categoria}
                onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                className="border border-gray-300 rounded p-2 w-full"
              />
              <div className="flex gap-2">
                <button
                  onClick={addProduct}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setNewProduct({
                      nome: "",
                      preco: "",
                      quantidade: "",
                      marca: "",
                      categoria: "",
                    });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabela de Produtos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 mt-6">
            Nenhum produto encontrado.
          </div>
        ) : (
        <table className="table-auto w-full border border-gray-300 text-center">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border border-gray-300 flex items-center justify-center">
                {/* Checkbox para selecionar todos */}
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.length === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                  onChange={selectAllProducts}
                  disabled={isLoading} // Desabilita o checkbox durante o carregamento
                />

                {/* Spinner ou Botão de Excluir */}
                {selectedProducts.length > 0 && (
                  <div className="ml-2 flex items-center">
                    {isLoading ? (
                      <div className="spinner w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <button
                        onClick={deleteSelectedProducts}
                        disabled={isLoading} // Evita múltiplos cliques durante o carregamento
                        className={`icon-button ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <TrashIcon className="trash-icon" />
                      </button>
                    )}
                  </div>
                )}
              </th>
              <th className="px-4 py-2 border border-gray-300">Nome</th>
              <th className="px-4 py-2 border border-gray-300">Preço</th>
              <th className="px-4 py-2 border border-gray-300">Quantidade</th>
              <th className="px-4 py-2 border border-gray-300">Marca</th>
              <th className="px-4 py-2 border border-gray-300">Categoria</th>
              <th className="px-4 py-2 border border-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr
                key={product.id}
                className={`${
                  selectedProducts.includes(product.id)
                    ? "bg-yellow-100"
                    : index % 2 === 0
                    ? "bg-gray-50"
                    : "bg-white"
                } hover:bg-gray-200`}
              >
                <td className="px-4 py-2 border border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelectProduct(product.id)}
                  />
                </td>
                {editingProduct?.id === product.id ? (
                  <>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        defaultValue={product.nome}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, nome: e.target.value })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        defaultValue={product.preco}
                       
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            preco: parseFloat(e.target.value),
                          })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        defaultValue={product.quantidade}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            quantidade: parseInt(e.target.value, 10),
                          })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        defaultValue={product.marca}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            marca: e.target.value,
                          })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        defaultValue={product.categoria}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            categoria: e.target.value,
                          })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button
                        onClick={() =>
                          updateProduct(product.id, editingProduct as Product)
                        }
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 border border-gray-300">{product.nome}</td>
                    <td className="px-4 py-2 border border-gray-300">{product.preco}</td>
                    <td className="px-4 py-2 border border-gray-300">{product.quantidade}</td>
                    <td className="px-4 py-2 border border-gray-300">{product.marca}</td>
                    <td className="px-4 py-2 border border-gray-300">{product.categoria}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Excluir
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>)}
      </div>
    </div>
  );
};

export default ProductTable;
