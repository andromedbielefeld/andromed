// Update the fetchExaminations function to include specialties
fetchExaminations: async () => {
  set({ isLoading: true, error: null });
  try {
    const { data, error } = await supabase
      .from('examinations')
      .select(`
        id,
        name,
        category_id,
        duration_minutes,
        body_side_required,
        examination_categories ( name ),
        examination_devices ( device_id ),
        examination_specialties ( specialty_id )
      `);

    if (error) throw error;

    const transformedExaminations = data.map((exam: any) => ({
      id: exam.id,
      name: exam.name,
      categoryId: exam.category_id,
      categoryName: (exam.examination_categories && exam.examination_categories.name) || 'Unbekannt',
      durationMinutes: exam.duration_minutes,
      bodySideRequired: exam.body_side_required || false,
      deviceIds: exam.examination_devices.map((ed: any) => ed.device_id),
      specialtyIds: exam.examination_specialties.map((es: any) => es.specialty_id)
    }));

    set({ examinations: transformedExaminations, isLoading: false });
  } catch (error: any) {
    set({ error: error?.message || 'Failed to fetch examinations', isLoading: false });
  }
},

// Update the addExamination function to handle specialties
addExamination: async (examination) => {
  set({ isLoading: true, error: null });
  try {
    const { deviceIds, specialtyIds, ...examinationData } = examination;

    // 1. Insert examination
    const { data: newExamination, error: examinationError } = await supabase
      .from('examinations')
      .insert([{
        name: examinationData.name,
        category_id: examinationData.categoryId,
        duration_minutes: examinationData.durationMinutes,
        body_side_required: examinationData.bodySideRequired || false
      }])
      .select()
      .single();

    if (examinationError) throw examinationError;
    if (!newExamination) throw new Error('Failed to create examination entry');

    // 2. Insert device associations
    if (deviceIds && deviceIds.length > 0) {
      const examinationDevicesData = deviceIds.map(deviceId => ({
        examination_id: newExamination.id,
        device_id: deviceId
      }));

      const { error: edError } = await supabase
        .from('examination_devices')
        .insert(examinationDevicesData);

      if (edError) throw edError;
    }

    // 3. Insert specialty associations
    if (specialtyIds && specialtyIds.length > 0) {
      const examinationSpecialtiesData = specialtyIds.map(specialtyId => ({
        examination_id: newExamination.id,
        specialty_id: specialtyId
      }));

      const { error: esError } = await supabase
        .from('examination_specialties')
        .insert(examinationSpecialtiesData);

      if (esError) throw esError;
    }

    // Fetch updated list
    await get().fetchExaminations();
    set({ isLoading: false });
  } catch (error: any) {
    set({ error: error?.message || 'Failed to add examination', isLoading: false });
  }
},

// Update the updateExamination function to handle specialties
updateExamination: async (id, data) => {
  set({ isLoading: true, error: null });
  try {
    // 1. Update examination data
    const { error: updateError } = await supabase
      .from('examinations')
      .update({
        name: data.name,
        category_id: data.categoryId,
        duration_minutes: data.durationMinutes,
        body_side_required: data.bodySideRequired
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // 2. Update device associations if provided
    if (data.deviceIds) {
      // First delete existing associations
      const { error: deleteDevicesError } = await supabase
        .from('examination_devices')
        .delete()
        .eq('examination_id', id);

      if (deleteDevicesError) throw deleteDevicesError;

      // Then insert new ones
      if (data.deviceIds.length > 0) {
        const examinationDevicesData = data.deviceIds.map(deviceId => ({
          examination_id: id,
          device_id: deviceId
        }));

        const { error: insertDevicesError } = await supabase
          .from('examination_devices')
          .insert(examinationDevicesData);

        if (insertDevicesError) throw insertDevicesError;
      }
    }

    // 3. Update specialty associations if provided
    if (data.specialtyIds) {
      // First delete existing associations
      const { error: deleteSpecialtiesError } = await supabase
        .from('examination_specialties')
        .delete()
        .eq('examination_id', id);

      if (deleteSpecialtiesError) throw deleteSpecialtiesError;

      // Then insert new ones
      if (data.specialtyIds.length > 0) {
        const examinationSpecialtiesData = data.specialtyIds.map(specialtyId => ({
          examination_id: id,
          specialty_id: specialtyId
        }));

        const { error: insertSpecialtiesError } = await supabase
          .from('examination_specialties')
          .insert(examinationSpecialtiesData);

        if (insertSpecialtiesError) throw insertSpecialtiesError;
      }
    }

    // Fetch updated list
    await get().fetchExaminations();
    set({ isLoading: false });
  } catch (error: any) {
    set({ error: error?.message || 'Failed to update examination', isLoading: false });
  }
},