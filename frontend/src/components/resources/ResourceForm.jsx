import React, { useEffect, useMemo, useState } from 'react'

export function ResourceForm({ initialData, onSubmit, onCancel, isEditing = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      type: 'LECTURE_HALL',
      capacity: 10,
      location: '',
      availabilityStart: '08:00',
      availabilityEnd: '18:00',
      availableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      status: 'ACTIVE',
      description: '',
      amenities: [],
      equipmentSerialNumber: '',
      labSafetyNotes: '',
    },
  )
  const [imageFile, setImageFile] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [amenitiesText, setAmenitiesText] = useState(
    (initialData?.amenities || []).join(', '),
  )

  const previewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile)
    return initialData?.imageUrl || ''
  }, [imageFile, initialData?.imageUrl])

  const galleryPreviews = useMemo(() => {
    const urls = []
    for (const f of imageFiles) {
      urls.push(URL.createObjectURL(f))
    }
    return urls
  }, [imageFiles])

  useEffect(() => {
    return () => {
      for (const u of galleryPreviews) URL.revokeObjectURL(u)
    }
  }, [galleryPreviews])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value,
    }))
  }

  const toggleDay = (day) => {
    setFormData((prev) => {
      const set = new Set(prev.availableDays || [])
      if (set.has(day)) set.delete(day)
      else set.add(day)
      return { ...prev, availableDays: Array.from(set) }
    })
  }

  const timeValid = useMemo(() => {
    return String(formData.availabilityStart) < String(formData.availabilityEnd)
  }, [formData.availabilityStart, formData.availabilityEnd])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!timeValid) {
      alert('Availability start must be before availability end')
      return
    }
    const amenities = (amenitiesText || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onSubmit({ ...formData, amenities, imageFile, imageFiles })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6 max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Resource Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Resource Type *
          </label>
          <select
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-white"
          >
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LABORATORY">Laboratory</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Capacity (People) *
          </label>
          <input
            type="number"
            name="capacity"
            required
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Availability Start *
          </label>
          <input
            type="time"
            name="availabilityStart"
            required
            value={formData.availabilityStart}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Availability End *
          </label>
          <input
            type="time"
            name="availabilityEnd"
            required
            value={formData.availabilityEnd}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        {!timeValid && (
          <div className="col-span-1 md:col-span-2">
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              Availability start must be before availability end.
            </p>
          </div>
        )}

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-campus-gray-700 mb-2">
            Available Days
          </label>
          <div className="flex flex-wrap gap-2">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => {
              const active = (formData.availableDays || []).includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    active
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-white text-campus-gray-700 border-campus-gray-300 hover:bg-campus-gray-50'
                  }`}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Status *
          </label>
          <select
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-white"
          >
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Resource Image
          </label>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Resource preview"
              className="w-full h-40 object-cover rounded-lg border border-campus-gray-200 mb-2"
            />
          ) : (
            <div className="w-full h-40 rounded-lg border border-dashed border-campus-gray-300 bg-campus-gray-50 flex items-center justify-center text-sm text-campus-gray-500 mb-2">
              No image selected
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg bg-white"
          />
          {imageFile && (
            <button
              type="button"
              onClick={() => setImageFile(null)}
              className="mt-2 text-sm text-red-700 hover:text-red-800"
            >
              Remove selected image
            </button>
          )}
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Image Gallery (multiple)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg bg-white"
          />
          {galleryPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              {galleryPreviews.map((u) => (
                <img
                  key={u}
                  src={u}
                  alt="Gallery preview"
                  className="w-full h-24 object-cover rounded-lg border border-campus-gray-200"
                />
              ))}
            </div>
          )}
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Amenities / Tags
          </label>
          <input
            type="text"
            value={amenitiesText}
            onChange={(e) => setAmenitiesText(e.target.value)}
            placeholder="e.g., Projector, AC, Whiteboard"
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg"
          />
          <p className="text-xs text-campus-gray-500 mt-1">
            Separate with commas.
          </p>
        </div>

        {formData.type === 'EQUIPMENT' && (
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-campus-gray-700 mb-1">
              Equipment Serial Number
            </label>
            <input
              type="text"
              name="equipmentSerialNumber"
              value={formData.equipmentSerialNumber || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg"
            />
          </div>
        )}

        {formData.type === 'LABORATORY' && (
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-campus-gray-700 mb-1">
              Lab Safety Notes
            </label>
            <textarea
              name="labSafetyNotes"
              rows={3}
              value={formData.labSafetyNotes || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg resize-none"
              placeholder="Any lab rules or safety requirements..."
            />
          </div>
        )}

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-campus-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-campus-gray-700 hover:bg-campus-gray-100 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
        >
          {isEditing ? 'Save Changes' : 'Create Resource'}
        </button>
      </div>
    </form>
  )
}

