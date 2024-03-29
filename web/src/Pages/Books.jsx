import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { RiEdit2Line, RiDeleteBin6Line } from "react-icons/ri";
import Search from "../public/search.svg";
import ButtonReturn from "../components/ButtonReturn";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Book() {
  const [livros, setLivros] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLivros() {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://sibi-api.vercel.app/livros?nome=${filtroNome}&categoria=${filtroCategoria}`
        );
        setLivros(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
        toast.error("Erro ao buscar livros.");
      }
    }

    fetchLivros();
  }, [filtroNome, filtroCategoria]);

  const handleFiltroNomeChange = (e) => {
    setFiltroNome(e.target.value);
  };

  const handleFiltroCategoriaChange = (e) => {
    setFiltroCategoria(e.target.value);
  };

  const handleEdit = (livro) => {
    setLivroSelecionado(livro);
  };

  const handleDelete = async (livroId) => {
    try {
      await axios.delete(`https://sibi-api.vercel.app/livros/${livroId}`);
      const updatedLivros = livros.filter((livro) => livro.id !== livroId);
      setLivros(updatedLivros);
      toast.success("Livro deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar livro:", error);
      toast.error("Erro ao deletar livro.");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado");
        return;
      }

      await axios.put(
        `https://sibi-api.vercel.app/livros/${livroSelecionado.id}`,
        livroSelecionado,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLivroSelecionado(null);

      const updatedLivros = livros.map((livro) => {
        if (livro.id === livroSelecionado.id) {
          return livroSelecionado;
        }
        return livro;
      });
      setLivros(updatedLivros);
      toast.success("Livro editado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar edição do livro:", error);
      toast.error("Erro ao editar livro.");
    }
  };

  const handleCancelEdit = () => {
    setLivroSelecionado(null);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 pb-11">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="relative w-full md:w-[75%] py-2 md:py-6">
            <input
              type="text"
              placeholder="Pesquisar livro pelo nome..."
              value={filtroNome}
              onChange={handleFiltroNomeChange}
              className="w-full border border-gray-300 px-4 py-2 md:py-4 rounded-full focus:outline-none focus:border-blue-500"
            />
            <button className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center">
              <img
                src={Search}
                className="w-5 h-5 md:w-6 md:h-6"
                alt="Search icon"
              />
            </button>
          </div>
          <select
            value={filtroCategoria}
            onChange={handleFiltroCategoriaChange}
            className="bg-blue-500 rounded-md text-white px-4 py-2 md:py-3 mt-2 md:mt-0"
          >
            <option value="Todos">TODOS</option>
            <option value="Romance">Romance</option>
            <option value="Aventura">Aventura</option>
            <option value="Fantasia">Fantasia</option>
            <option value="Drama">Drama</option>
            <option value="Suspense">Suspense</option>
            <option value="TerrorHorror">TerrorHorror</option>
            <option value="Crônica">Crônica</option>
            <option value="Conto">Conto</option>
            <option value="Poesia">Poesia</option>
            <option value="Biografia">Biografia</option>
            <option value="Nacional">Nacional</option>
            <option value="Material Acadêmico">Material Acadêmico</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <ButtonReturn />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="animate-pulse bg-gray-200 p-6 rounded-lg shadow-md mb-6 h-40"></div>
          ) : (
            livros.map((livro) => (
              <motion.div
                key={livro.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`bg-white p-6 rounded-lg shadow-md mb-6 relative border border-gray-300 ${
                  livro.quantidade === 1
                    ? "border-red-500"
                    : livro.quantidade < 3
                    ? "border-yellow-500"
                    : "border-green-500"
                }`}
              >
                <p className="font-bold text-lg mb-2">{livro.nome}</p>
                <p className="text-gray-600 mb-1">ID: {livro.id}</p>
                <p className="text-gray-600 mb-1">Autor: {livro.autor}</p>
                <p className="text-gray-600 mb-1">Gênero: {livro.genero}</p>
                <p className="text-gray-600">Quantidade: {livro.quantidade}</p>
                <div className="absolute top-0 right-0 mt-2 mr-2 flex items-center space-x-2">
                  <button
                    className="text-blue-500"
                    onClick={() => handleEdit(livro)}
                  >
                    <RiEdit2Line className="w-8 h-8 p-1" />
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => handleDelete(livro.id)}
                  >
                    <RiDeleteBin6Line className="w-8 h-8 p-1" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
        <div className="text-center mt-4">
          <ToastContainer position="bottom-right" />
        </div>
      </div>
      {livroSelecionado && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-10"
        >
          <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-96">
            <h2 className="text-xl font-bold mb-4">Editar Livro</h2>
            <div className="mb-4">
              <label className="block mb-1">Nome:</label>
              <input
                type="text"
                value={livroSelecionado.nome}
                onChange={(e) =>
                  setLivroSelecionado({
                    ...livroSelecionado,
                    nome: e.target.value,
                  })
                }
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Autor:</label>
              <input
                type="text"
                value={livroSelecionado.autor}
                onChange={(e) =>
                  setLivroSelecionado({
                    ...livroSelecionado,
                    autor: e.target.value,
                  })
                }
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Gênero:</label>
              <input
                type="text"
                value={livroSelecionado.genero}
                onChange={(e) =>
                  setLivroSelecionado({
                    ...livroSelecionado,
                    genero: e.target.value,
                  })
                }
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Quantidade:</label>
              <input
                type="number"
                value={livroSelecionado.quantidade}
                onChange={(e) =>
                  setLivroSelecionado({
                    ...livroSelecionado,
                    quantidade: parseInt(e.target.value),
                  })
                }
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleSaveEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Salvar
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
