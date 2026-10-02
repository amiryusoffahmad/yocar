"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";

type Car = {
  id: string;
  name: string;
  brand: string;
  model: string;
  price_per_day: number;
  image_url: string | null;
  description: string | null;
};

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    brand: "",
    model: "",
    price_per_day: "",
    image_url: "",
    description: "",
  });

  async function loadCars() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD CARS ERROR:", error);
    }

    setCars(data || []);
    setLoading(false);
  }

  useEffect(() => {
  async function checkAdmin() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || profile?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    await loadCars();
  }

  checkAdmin();
}, [router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function startEdit(car: Car) {
    setEditingCar(car);

    setForm({
      name: car.name,
      brand: car.brand,
      model: car.model,
      price_per_day: String(car.price_per_day),
      image_url: car.image_url || "",
      description: car.description || "",
    });

    setShowForm(true);
  }

  function resetForm() {
    setForm({
      name: "",
      brand: "",
      model: "",
      price_per_day: "",
      image_url: "",
      description: "",
    });

    setEditingCar(null);
    setShowForm(false);
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);

    const supabase = createClient();

    const carData = {
      name: form.name,
      brand: form.brand,
      model: form.model,
      price_per_day: Number(form.price_per_day),
      image_url: form.image_url || null,
      description: form.description || null,
    };

    if (editingCar) {
      const { error } = await supabase
        .from("cars")
        .update(carData)
        .eq("id", editingCar.id);

      if (error) {
        console.error("UPDATE CAR ERROR:", error);
        alert(`Failed to update car: ${error.message}`);
        setSaving(false);
        return;
      }

      alert("Car updated successfully!");
    } else {
      const { error } = await supabase
        .from("cars")
        .insert(carData);

      if (error) {
        console.error("ADD CAR ERROR:", error);
        alert(`Failed to add car: ${error.message}`);
        setSaving(false);
        return;
      }

      alert("Car added successfully!");
    }

    resetForm();
    setSaving(false);

    await loadCars();
  }

  async function handleDelete(carId: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this car?"
  );

  if (!confirmed) return;

  const supabase = createClient();

  const { error } = await supabase
    .from("cars")
    .delete()
    .eq("id", carId);

  if (error) {
    console.error("DELETE CAR ERROR:", error);
    alert(`Failed to delete car: ${error.message}`);
    return;
  }

  alert("Car deleted successfully!");

  await loadCars();
}
  if (loading) {
    return (
      <main className="p-8">
        Loading cars...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Manage Cars
            </h1>

            <p className="mt-2 text-gray-500">
              Manage all cars available for rental.
            </p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            {showForm ? "Close Form" : "+ Add Car"}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-2xl border bg-white p-6">
            <h2 className="mb-6 text-xl font-bold">
              {editingCar ? "Edit Car" : "Add New Car"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Car Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Axia"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Brand
                </label>

                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Example: Perodua"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Model
                </label>

                <input
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Example: 1.0 G"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price Per Day (RM)
                </label>

                <input
                  name="price_per_day"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price_per_day}
                  onChange={handleChange}
                  placeholder="100"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Image URL
                </label>

                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-lg border px-4 py-3 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the car..."
                  rows={4}
                  className="w-full rounded-lg border px-4 py-3 outline-none"
                />
              </div>

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingCar
                    ? "Save Changes"
                    : "Add Car"}
                </button>

                {editingCar && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border px-6 py-3 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {cars.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center">
            <p className="text-gray-500">
              No cars found.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <div
                key={car.id}
                className="overflow-hidden rounded-2xl border bg-white"
              >
                {car.image_url ? (
                  <img
                    src={car.image_url}
                    alt={car.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <h2 className="text-xl font-bold">
                    {car.brand} {car.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {car.model}
                  </p>

                  <p className="mt-4 text-lg font-bold">
                    RM {Number(car.price_per_day).toFixed(2)}
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      / day
                    </span>
                  </p>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => startEdit(car)}
                      className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium"
                    >
                      Edit
                    </button>

                    <button
  onClick={() => handleDelete(car.id)}
  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
>
  Delete
</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}