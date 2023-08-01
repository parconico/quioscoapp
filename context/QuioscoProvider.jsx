import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const QuioscoContext = createContext();

const QuioscoProvider = ({ children }) => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaActual, setcategoriaActual] = useState({});
  const [producto, setProducto] = useState({});
  const [modal, setModal] = useState(false);
  const [pedido, setPedido] = useState([]);
  const [nombre, setNombre] = useState("");
  const [total, setTotal] = useState(0);

  const router = useRouter();

  const obtenerCategorias = async () => {
    const { data } = await axios("/api/categorias");
    setCategorias(data);
  };
  useEffect(() => {
    obtenerCategorias();
  }, []);

  //Categoria por default
  useEffect(() => {
    setcategoriaActual(categorias[0]);
  }, [categorias]);

  useEffect(() => {
    const nuevoTotal = pedido.reduce(
      (total, producto) => producto.precio * producto.cantidad + total,
      0
    );
    setTotal(nuevoTotal);
  }, [pedido]);

  const handleClickCategoria = (id) => {
    const categoria = categorias.filter((cat) => cat.id === id);
    setcategoriaActual(categoria[0]);
    router.push("/");
  };

  const handleSetProducto = (producto) => {
    setProducto(producto);
  };

  const handleChangeModal = () => {
    setModal(!modal);
  };

  const handleAgregarPedido = ({ categoriaId, ...producto }) => {
    //Ese codigo me saca categoriaId e imagen del state
    if (pedido.some((productoState) => productoState.id === producto.id)) {
      //Actualizar cantidad
      const pedidoActualizado = pedido.map((productoState) =>
        productoState.id === producto.id ? producto : productoState
      );
      setPedido(pedidoActualizado);
      toast.success("Guardado Correctamente");
    } else {
      setPedido([...pedido, producto]);
      toast.success("Agregado al Pedido");
    }
    setModal(false);
  };

  const handleEditarCantidades = (id) => {
    const productoActualizar = pedido.filter((producto) => producto.id === id);
    setProducto(productoActualizar[0]);

    setModal(!modal);
  };

  const handleEliminarProducto = (id) => {
    const pedidoActualizado = pedido.filter((producto) => producto.id !== id);
    setPedido(pedidoActualizado);
  };

  const colocarOrder = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/ordenes", {
        pedido,
        nombre,
        total,
        fecha: Date.now().toString(),
      });

      //Resetear la app
      setcategoriaActual(categorias[0]);
      setPedido([]);
      setNombre("");
      setTotal(0);

      toast.success("Pedido Realizado Correctamente");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.log(error);
    }
    console.log("Enviando ordern...");
  };

  return (
    <QuioscoContext.Provider
      value={{
        categorias,
        categoriaActual,
        handleClickCategoria,
        producto,
        handleSetProducto,
        modal,
        handleChangeModal,
        handleAgregarPedido,
        pedido,
        handleEditarCantidades,
        handleEliminarProducto,
        nombre,
        setNombre,
        colocarOrder,
        total,
      }}
    >
      {children}
    </QuioscoContext.Provider>
  );
};

export { QuioscoProvider };
export default QuioscoContext;
