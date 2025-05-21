import React, { useState, ChangeEvent, DragEvent } from "react";
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import TextInput from '@/Components/Login/TextInput';
import Dropdown from '@/Components/Dropdown/Dropdown';
import Breadcrumb from "@/Components/Nav/Breadcrumb";

const categories = [
    "Agar", "Apparel", "Books", "Equipment", "Foraging", "Gourmet", "Grow Kits", 
    "Infused Products", "Microscopy", "Spawn", "Spores"
];

export default function AddItem() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        category: '',
        price: '',
        stock: '',
        images: [] as File[],
        description: '',
        weight: '',
        isPsyilocybinSpores: false,
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const Layout = AuthenticatedLayout;

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files) as File[];
        const validImages = files.filter(file =>
            file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
        );
        if (validImages.length > 0) {
            const newPreviews = validImages.map(f => URL.createObjectURL(f));
            setImagePreviews([...imagePreviews, ...newPreviews]);
            setData('images', [...data.images, ...validImages]);
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        const validImages = files.filter(file =>
            file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
        );
        if (validImages.length > 0) {
            const newPreviews = validImages.map(f => URL.createObjectURL(f));
            setImagePreviews([...imagePreviews, ...newPreviews]);
            setData('images', [...data.images, ...validImages]);
        }
    };

    const handleRemoveImage = (idx: number) => {
        const previews = [...imagePreviews];
        const files = [...data.images];
        previews.splice(idx, 1);
        files.splice(idx, 1);
        setImagePreviews(previews);
        setData('images', files);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('items.store'), { data });
    };




    return (
        <Layout 
            header={
            <div className="h-[5vh] w-full flex items-center justify-between">
            <Breadcrumb
                items={[
                { label: 'SHOP', link: route('shop') },
                { label: 'ADD AN ITEM ' },
                ]}
            />
            </div>
        }>
            <Head title="Add New Item" />

            <div className="relative flex justify-center items-center w-full mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="relative w-full   bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden">
                    <form onSubmit={submit} className="flex flex-col p-8 gap-4">
                        <h2 className="text-2xl font-bold font-Poppins text-left dark:text-white">NEW ITEM</h2>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Item Name" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="mt-1 w-full"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="category" value="Category" />
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="mt-1 w-full text-left border border-gray-200 dark:text-white  px-4 py-2 rounded-md">
                                            {data.category || 'Select a category'}
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <ul className="relative text-right w-full -mt-1 bg-white dark:bg-[#424549] shadow-lg  z-50">
                                            {categories.map(cat => (
                                                <li
                                                  key={cat}
                                                  className={`cursor-pointer px-4 py-2 font-Poppins hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70 text-gray-700 dark:text-gray-300`}
                                                  onClick={() => setData('category', cat)}
                                                >{cat}</li>
                                            ))}
                                        </ul>
                                    </Dropdown.Content>
                                </Dropdown>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="price" value="Price (GBP)" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={data.price}
                                    onChange={e => setData('price', e.target.value)}
                                    className="mt-1 w-full"
                                    required
                                />
                                <InputError message={errors.price} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="stock" value="Stock" />
                                <TextInput
                                    id="stock"
                                    type="number"
                                    value={data.stock}
                                    onChange={e => setData('stock', e.target.value)}
                                    className="mt-1 w-full"
                                />
                                <InputError message={errors.stock} className="mt-2" />
                            </div>


                            <div>
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="weight" value="Weight (kg)" />
                                <TextInput
                                    id="weight"
                                    type="number"
                                    step="0.01"
                                    value={data.weight}
                                    onChange={e => setData('weight', e.target.value)}
                                    className="mt-1 w-full"
                                />
                                <InputError message={errors.weight} className="mt-2" />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="isPsyilocybinSpores"
                                    type="checkbox"
                                    checked={data.isPsyilocybinSpores}
                                    onChange={e => setData('isPsyilocybinSpores', e.target.checked)}
                                    className="mr-2"
                                />
                                <InputLabel htmlFor="isPsyilocybinSpores" value="Is Psilocybin Spores?" />
                            </div>

                            <div>
                                <InputLabel value="Images" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="mt-1 w-full dark:text-white"
                                />
                                <div className="mt-2 flex space-x-4 flex-wrap">
                                    {imagePreviews.map((img, i) => (
                                        <div key={i} className="relative w-20 h-20">
                                            <img src={img} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(i)}
                                                className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <PrimaryButton type="submit" className="w-full" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Item'}
                        </PrimaryButton>
                        <SecondaryButton type="button" className="w-full" onClick={() => window.history.back()}>
                            Cancel
                        </SecondaryButton>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
