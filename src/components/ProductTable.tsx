import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { TrashIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/16/solid";
import isValidDate from "../components/date";

interface Product {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  marca: string;
  categoria: string;
  volume?: string;
  vencimento?: string;
}

const ProductTable: React.FC = () => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    nome: "",
    preco: "",
    quantidade: "",
    marca: "",
    categoria: "",
    volume: "",
    vencimento: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const sortProducts = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const aValue = key === 'preco' ? parseFloat(a[key] as unknown as string) : a[key];
      const bValue = key === 'preco' ? parseFloat(b[key] as unknown as string) : b[key];
  
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue; // Ordenação numérica
      }
  
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue); // Ordenação alfabética
      }
  
      return 0; // Caso os valores sejam incompatíveis, mantém a posição original
    });
  
    setFilteredProducts(sortedProducts);
  };     

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = products.filter(
      (product) =>
        product.nome.toLowerCase().includes(query) ||
        product.marca.toLowerCase().includes(query) ||
        product.categoria.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const paginateProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
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
    const userConfirmed = window.confirm("Tem certeza de que deseja excluir este produto? Essa ação é irreversível");
    if (!userConfirmed) return;

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
    if (updatedData.vencimento && !isValidDate(updatedData.vencimento)) {
      alert("O vencimento do produto é inválido ou o produto já venceu.");
      return;
    }
    await updateDoc(doc(db, "produtos", id), updatedData);
    setEditingProduct(null);
    fetchProducts();
  };

  const addProduct = async () => {
    if (!newProduct.nome || !newProduct.preco || !newProduct.quantidade || !newProduct.marca) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

    if (!isValidDate(newProduct.vencimento)) {
      alert("O vencimento do produto é inválido ou o produto já venceu.");
      return;
    }

    try {
      await addDoc(collection(db, "produtos"), {
        nome: newProduct.nome,
        preco: parseFloat(newProduct.preco),
        quantidade: parseInt(newProduct.quantidade),
        marca: newProduct.marca,
        categoria: newProduct.categoria || "-",
        volume: newProduct.volume || "-",
        vencimento: newProduct.vencimento || "-",
      });      

      alert("Produto adicionado com sucesso!");
      setNewProduct({ nome: "", preco: "", quantidade: "", marca: "", categoria: "", volume: "", vencimento: "" });
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
              <input
                type="text"
                placeholder="Volume"
                value={newProduct.volume}
                onChange={(e) => setNewProduct({ ...newProduct, volume: e.target.value })}
                className="border border-gray-300 rounded p-2 w-full"
              />
              <input
                type="text"
                placeholder="Vencimento (MM/AA)"
                value={newProduct.vencimento}
                onChange={(e) => {
                  const input = e.target.value;

                  // Permitir apenas números e "/"
                  if (/^\d{0,2}\/?\d{0,2}$/.test(input)) {
                    setNewProduct({ ...newProduct, vencimento: input });
                  }
                }}
                maxLength={5}
                className={`border rounded p-2 w-full ${
                  newProduct.vencimento && !isValidDate(newProduct.vencimento) ? "border-red-500" : "border-gray-300"
                }`}
              />
              {newProduct.vencimento && !isValidDate(newProduct.vencimento) && (
                <p style={{ color: "red" }}>Insira uma vencimento no formato MM/AA e futura.</p>
              )}
              <div className="button-edit-group flex gap-2">
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
                      volume: "",
                      vencimento: "",
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
        <div className="table-container">
        <table className="table-produtos table-auto w-full border border-gray-300 text-center">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border border-gray-300 flex items-center justify-center">
                {/* Checkbox para selecionar todos */}
                Sel. todos<br></br>
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
                      >{`(${selectedProducts.length})`}
                        <TrashIcon className="trash-icon" />
                      </button>
                    )}
                  </div>
                )}
              </th>
              <th
                className="px-4 py-2 border border-gray-300 cursor-pointer"
                onClick={() => sortProducts("nome")}
              >
                Nome{" "}
                {sortConfig?.key === "nome" ? (
                  sortConfig.direction === "asc" ? "▲" : "▼"
                ) : (
                  "▲▼"
                )}
              </th>
              <th
                className="px-4 py-2 border border-gray-300 cursor-pointer"
                onClick={() => sortProducts("preco")}
              >
                Preço{" "}
                {sortConfig?.key === "preco" ? (
                  sortConfig.direction === "asc" ? "▲" : "▼"
                ) : (
                  "▲▼"
                )}
              </th>
              <th
                className="px-4 py-2 border border-gray-300 cursor-pointer"
                onClick={() => sortProducts("quantidade")}
              >
                Quantidade{" "}
                {sortConfig?.key === "quantidade" ? (
                  sortConfig.direction === "asc" ? "▲" : "▼"
                ) : (
                  "▲▼"
                )}
              </th>
              <th
                className="px-4 py-2 border border-gray-300 cursor-pointer"
                onClick={() => sortProducts("marca")}
              >
                Marca{" "}
                {sortConfig?.key === "marca" ? (
                  sortConfig.direction === "asc" ? "▲" : "▼"
                ) : (
                  "▲▼"
                )}
              </th>
              <th
                className="px-4 py-2 border border-gray-300 cursor-pointer"
                onClick={() => sortProducts("categoria")}
              >
                Categoria{" "}
                {sortConfig?.key === "categoria" ? (
                  sortConfig.direction === "asc" ? "▲" : "▼"
                ) : (
                  "▲▼"
                )}
              </th>
              <th
                className="px-4 py-2 border border-gray-300 cursor-pointer"
                onClick={() => sortProducts("volume")}
              >
                Volume{" "}
                {sortConfig?.key === "volume" ? (
                  sortConfig.direction === "asc" ? "▲" : "▼"
                ) : (
                  "▲▼"
                )}
              </th>
              <th
                className="px-4 py-2 border border-gray-300 cursor-pointer"
                onClick={() => sortProducts("vencimento")}
              >
                Vencimento{" "}
                {sortConfig?.key === "vencimento" ? (
                  sortConfig.direction === "asc" ? "▲" : "▼"
                ) : (
                  "▲▼"
                )}
              </th>
              <th className="px-4 py-2 border border-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginateProducts().map((product) => (
                <tr key={product.id} className="hover:bg-gray-200">
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
                      <input
                        defaultValue={product.volume}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            volume: e.target.value,
                          })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        type="text"
                        value={editingProduct?.vencimento || ""}
                        onChange={(e) => {
                          const input = e.target.value;

                          // Permite apenas o formato MM/AA com números e barra
                          if (/^\d{0,2}\/?\d{0,2}$/.test(input)) {
                            setEditingProduct({
                              ...editingProduct,
                              vencimento: input.slice(0, 5), // Limita a 5 caracteres
                            });
                          }
                        }}
                        className={`border border-gray-300 rounded p-1 w-full ${
                          editingProduct?.vencimento && !isValidDate(editingProduct.vencimento) ? "border-red-500" : "border-gray-300"
                        }`}
                        maxLength={5} // Limita o campo para no máximo 5 caracteres
                      />
                      {editingProduct?.vencimento && !isValidDate(editingProduct.vencimento) && (
                        <p style={{ color: "red" }}>Vencimento inválido ou passado.</p>
                      )}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <div className="button-group">
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
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 border border-gray-300">{product.nome}</td>
                    <td className="px-4 py-2 border border-gray-300">{product.preco}</td>
                    <td className="px-4 py-2 border border-gray-300">{product.quantidade}</td>
                    <td className="px-4 py-2 border border-gray-300">{product.marca}</td>
                    <td className="px-4 py-2 border border-gray-300">{product.categoria}</td>
                    <td className="px-4 py-2 border border-gray-300">{product.volume}</td>
                    <td className="px-4 py-2 border border-gray-300">{product.vencimento}</td>
                    <td className="px-4 py-2 border border-gray-300">
                    <div className="button-group">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Excluir
                      </button>
                    </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>)}
        
        <div className="pagination">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
           ◀ Anterior
          </button>
          <span className="text-gray-500">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Próxima ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
